const mongoose = require('mongoose');
const {aggregator, AggregatorClass} = require('./dist');
const {
  ProjectBuilder,
  GroupBuilder,
  SortBuilder,
  LookupBuilder,
  UnwindBuilder,
  FacetBuilder,
  UnionWithBuilder,
} = require('./dist/builders');
const {
  ProjectStage,
  UnionWithStage,
  LimitStage,
  MatchStage,
  SortStage,
} = require('./dist/stages');
const {
  $Map,
  $Filter,
  $Cond,
  $Switch,
  $Reduce,
} = require('./dist/operators');

const schema = new mongoose.Schema({}, {strict: false});

const Model = mongoose.model('Model', schema, 'clients');
const LogModel = mongoose.model('LogModel', schema, 'logs');

beforeAll(async () => {
  await mongoose.connect('');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Aggregator Use Cases', () => {

  it('should take arguments in the macros', function() {

    AggregatorClass.registerMacro("macroWithArgs", (userId, userNewId) => {
      return [
          new MatchStage({
            id: userId,
            newUserId: userNewId
          }).build()
      ]
    })

    const result =
        aggregator(Model)
        .useMacro("macroWithArgs", 5, 6)
            .toJSON()

    expect(result).toEqual([ { '$match': { id: 5, newUserId: 6 } } ])

  });

  it('should match company name with PBADGE', async () => {
    const data = await aggregator(Model).match({companyName: 'PBADGE'}).exec();
    expect(data.length).toBe(1);
    expect(data[0].companyName).toBe('PBADGE');
  });

  it('should project only companyName field', async () => {
    const [data] = await aggregator(Model).
        limit(1).
        project(
            new ProjectBuilder().add('companyName', 1).add('_id', 0).done()).
        exec();

    expect(data).toHaveProperty('companyName');
    expect(Object.values(data)).toHaveLength(1);
  });

  it('should limit the results to 1', async () => {
    const data = await aggregator(Model).limit(1).exec();
    expect(data.length).toBe(1);
  });

  it('should sort by createdAt descending', async () => {
    const data = await aggregator(Model).sort({createdAt: -1}).limit(1).exec();
    expect(data.length).toBeGreaterThan(0);
  });

  it('should group by companyName and count', async () => {
    const data = await aggregator(Model).
        group({_id: '$companyName', total: {$sum: 1}}).
        exec();

    expect(data[0]).toHaveProperty('_id');
    expect(data[0]).toHaveProperty('total');
  });

  it('should use a lookup stage with projection inside', async () => {
    const [data] = await aggregator(Model).
        match({isParentCompany: false}).
        limit(1).
        lookup(
            new LookupBuilder().from('clients').
                as('parentCompany').
                localField('parentCompany').
                foreignField('_id').
                pipeline([
                  // Can also do the same using ProjectStage.
                  // new ProjectStage(
                  //     new ProjectBuilder().add("companyName", 1) // See as here not using .done()
                  // ).build() // This just needs to be there when using builder inside a stage
                  {
                    $project: new ProjectBuilder().add('companyName', 1).done(),
                  },
                ]).
                done(),
        ).
        unwind(new UnwindBuilder().path('$parentCompany').done()).
        exec();

    expect(data).toHaveProperty('parentCompany');
  });

  it('should use $map operator inside project stage', async () => {
    const data = await aggregator(Model).limit(1).project(
        new ProjectBuilder().add('scores',
            new $Map().input('$someArray').as('item').in(1).done(),
        ).done(),
    ).exec();

    expect(data[0]).toHaveProperty('scores');
  });

  it('should use $filter operator inside project stage', async () => {
    const data = await aggregator(Model).limit(1).project(
        new ProjectBuilder().add('filteredItems',
            new $Filter().input('$someArray').
                as('item').
                cond({$eq: ['$$item.active', true]}).
                done(),
        ).done(),
    ).exec();

    expect(data[0]).toHaveProperty('filteredItems');
  });

  it('should use facet stage to return multiple pipelines', async () => {
    const data = await aggregator(Model).facet(
        new FacetBuilder().add('byCompany', [
          new ProjectBuilder().add('companyName', 1).done(),
        ]).add('total', [
          {$count: 'count'},
        ]).done(),
    ).exec();

    expect(data[0]).toHaveProperty('byCompany');
    expect(data[0]).toHaveProperty('total');
  });

  it('should group by companyName and count documents per group', async () => {
    const data = await aggregator(Model).group(
        new GroupBuilder().add('_id',
            '$companyName')   // Group by the companyName field
            .add('count', {$sum: 1})    // Count how many documents per group
            .done(),
    ).exec();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('_id');
    expect(data[0]).toHaveProperty('count');
    expect(typeof data[0].count).toBe('number');
  });

  it('should group by status and calculate average age', async () => {
    const data = await aggregator(Model).group(
        new GroupBuilder().add('_id',
            '$status')             // Group by a status field
            .add('averageAge',
                {$avg: '$age'}) // Calculate average age per status
            .done(),
    ).exec();

    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('_id');
    expect(data[0]).toHaveProperty('averageAge');
  });

  it('should group and create a nested object with first document values',
      async () => {
        const data = await aggregator(Model).group(
            new GroupBuilder().add('_id', '$companyName').
                add('firstRecord',
                    {$first: '$$ROOT'}) // Grab the first full document
                .done(),
        ).exec();

        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toHaveProperty('firstRecord');
        expect(data[0].firstRecord).toHaveProperty('companyName');
      });

  it('should use $switch operator inside project stage', async () => {
    const data = await aggregator(Model).limit(1).project(
        new ProjectBuilder().add('parentCompany',
            new $Switch().branch({$eq: ['$isParentCompany', true]},
                'YES PARENT COMPANY').
                branch({$eq: ['$isParentCompany', false]},
                    'NOT A PARENT COMPANY').
                default('Unknown').
                done(),
        ).done(),
    ).exec();

    expect(data[0]).toHaveProperty('parentCompany');
  });

  it('should sum values using $reduce operator', async () => {
    const [data] = await aggregator(Model).limit(1).project(
        new ProjectBuilder().add('totalSum',
            new $Reduce().input([1, 2, 3, 4, 5]).
                initialValue(0).
                in({$add: ['$$value', '$$this']}).
                done(),
        ).done(),
    ).exec();

    expect(data).toHaveProperty('totalSum');
    expect(typeof data.totalSum).toBe('number');
  });

  it('should combine active and archived users', async () => {

    const results = await aggregator(Model).unionWith(
        new UnionWithStage(
            new UnionWithBuilder('archived_users').pipeline(
                [
                  new ProjectStage(
                      new ProjectBuilder().add('name', 1).
                          add('active', 1).
                          add('_id', 0),
                  ).build(),
                ]),
        ).build(),
    ).project({name: 1, active: 1, _id: 0}).exec();

    const names = results.map(r => r.name);
    expect(names).toContain('John');
    expect(names).toContain('Jane');
    expect(names).toContain('Old John');
  });

  it('should aggregate logs and errors from separate collections', async () => {
    const results = await aggregator(LogModel).match({level: 'info'}).unionWith(
        new UnionWithBuilder('logs').pipeline([
          {$match: {level: 'error'}},
          {$project: {message: 1, _id: 0}},
        ]),
    ).exec();

    const messages = results.map(r => r.message);
    expect(messages).toContain('Login success');
    expect(messages).toContain('System failure');
  });

  it('should merge and label current and archived users', async () => {
    const results = await aggregator(UserModel).
        project({name: 1, status: {$literal: 'current'}, _id: 0}).
        unionWith(
            new UnionWithBuilder('archived_users').pipeline([
              {
                $project: {
                  name: 1,
                  status: {$literal: 'archived'},
                  _id: 0,
                },
              },
            ]),
        ).
        exec();

    const statuses = results.map(r => r.status);
    expect(statuses).toContain('current');
    expect(statuses).toContain('archived');
  });

  it('should return paginated data with metadata', async () => {
    const [result] = await aggregator(Model).
        paginate({page: 1, perPage: 5}).
        exec();

    expect(result).toHaveProperty('metaData');
    expect(result.metaData).toHaveProperty('totalDocs');
    expect(result.metaData).toHaveProperty('totalPages');
    expect(result.metaData).toHaveProperty('hasNextPage');
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should use macro functionality to match', async () => {

    AggregatorClass.registerMacro('customProject', () => {
      return new ProjectStage(
          new ProjectBuilder().add('working', true),
      ).build();
    });

    AggregatorClass.registerMacro('customMatchAndSort', () => {
      return [
        new MatchStage({}).build(),
        new SortStage({
          createdAt: -1,
        }).build(),
        new ProjectStage(
            new ProjectBuilder().add('companyName', 1),
        ).build(),
      ];
    });

    const [result] = await aggregator(Model).useMacro('customMatchAndSort').
        limit(1).exec();

    expect(result).toHaveProperty('_id');
    expect(result).toHaveProperty('companyName');
  });

  it('should add aggregation stage conditionally', async () => {

    const result = aggregator(Model).
        match({isActive: true}).
        cond(true, b => b.match({role: 'admin'})).
        toJSON();

    expect(result).toEqual([
      {$match: {isActive: true}},
      {$match: {role: 'admin'}},
    ]);

  });

  it('should not apply the callback when condition is false', () => {

    const result = aggregator(Model).
        match({isActive: true}).
        cond(false, b => b.match({role: 'admin'})).
        toJSON();

    expect(result).toEqual([
      {$match: {isActive: true}},
    ]);
  });

  it('should evaluate function condition and apply callback if true', () => {

    const result = aggregator(Model).cond(() => true, b => b.limit(5)).toJSON();

    expect(result).toEqual([
      {$limit: 5},
    ]);
  });

  it('should evaluate function condition and skip callback if false', () => {
    const result =
        aggregator(Model).cond(() => false, b => b.limit(5)).toJSON();

    expect(result).toEqual([]);
  });

  it('should merge match stage', function() {

    const result = aggregator(Model)
        .match({ b: { $in : ["2"] } })
        .match({ a: 1 })
        .toJSON()

    expect(result.length).toBe(1);
    expect(result).toEqual([{"$match":{"b":{"$in":["2"]},"a":1}}]);
  });

  it('should not merge match stage since there is sort stage in between', function() {

    const result = aggregator(Model)
    .match({ a: 1 }).sort({ name: 1 }).match({ b: 2 }).toJSON();

    expect(result).toEqual([
      { $match: { a: 1 } },
      { $sort: { name: 1 } },
      { $match: { b: 2 } }
    ]);
  });

  it('should merge $match stages with overlapping keys using array strategy', () => {

    const result = aggregator(Model)
    .match({tags: {$in: ['a']}})
    .match({tags: {$in: ['b']}})
    .toJSON();

    expect(result).toEqual([
      {
        $match: {
          tags: {
            $in: ['a', 'b']
          }
        }
      }
    ]);
  });

  it('should add an inclusive date range match stage by default', () => {

    const result = aggregator(Model)
    .dateRange('createdAt', '2024-01-01', '2024-12-31').toJSON();

    expect(result).toEqual([
      {
        $match: {
          createdAt: {
            $gte: new Date('2024-01-01'),
            $lte: new Date('2024-12-31'),
          },
        },
      },
    ]);
  });

  it('should add an exclusive date range match stage when inclusive is false', () => {
    const result = aggregator(Model)
    .dateRange('createdAt', '2024-01-01', '2024-12-31', { inclusive: false }).toJSON;

    expect(result).toEqual([
      {
        $match: {
          createdAt: {
            $gt: new Date('2024-01-01'),
            $lt: new Date('2024-12-31'),
          },
        },
      },
    ]);
  });

  it('should add only a lower bound when "to" is not provided', () => {
    const result = aggregator(Model)
    .dateRange('createdAt', '2024-01-01', null).toJSON();

    expect(result).toEqual([
      {
        $match: {
          createdAt: {
            $gte: new Date('2024-01-01'),
          },
        },
      },
    ]);
  });

  it('should add only an upper bound when "from" is not provided', () => {

    const result = aggregator(Model)
    .dateRange('createdAt', null, '2024-12-31').toJSON();

    expect(result).toEqual([
      {
        $match: {
          createdAt: {
            $lte: new Date('2024-12-31'),
          },
        },
      },
    ]);
  });

});