# Mongo Aggregation Builder

A chainable, intuitive builder for creating MongoDB aggregation pipelines. Build dynamic and readable pipelines using classes and fluent syntax.

---

## 📦 Installation

```bash
npm install mongo-db-aggregator
```

or
```bash
yarn add mongo-db-aggregator
```

# 🚀 Features

- Fluent API for all major aggregation stages
- Modular Builders for $match, $project, $group, $sort, $lookup, $facet, and more.
- Embedded operator support ($map, $filter, $cond, etc.)
-Designed to work seamlessly with mongoose or native mongodb driver

# Examples

```javascript
const { aggregator } = require('mongo-db-aggregator');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({}, { strict: false });
const Model = mongoose.model('Client', schema, 'clients');

const data = await aggregator(Model, AggregationOptions)
  .match({ companyName: "PBADGE" })
  .project(new ProjectBuilder().add('companyName', 1).add('_id', 0).done())
  .limit(1)
  .exec();

console.log(data);
```

### Lookup with Projection Pipeline
```javascript
const data = await aggregator(Model, AggregationOptions)
  .lookup(
    new LookupBuilder()
      .from('clients')
      .as('client')
      .localField('client')
      .foreignField('_id')
      .pipeline([
        { $project: new ProjectBuilder().add('companyName', 1).done() }
      ])
      .done()
  )
  .unwind(new UnwindBuilder().path('$client').done())
  .exec();
```

### Using Operators (e.g., $map, $filter, $cond)
```javascript
const data = await aggregator(Model, AggregationOptions)
  .project(
    new ProjectBuilder().add('score',
      new $Map()
        .input('$$approvalTracking')
        .as('track')
        .in(1)
        .done()
    ).add('statusLabel',
      new $Cond()
        .if({ $eq: ["$status", "active"] })
        .then("Active")
        .else("Inactive")
        .done()
    ).done()
  )
  .exec();
```

### Pagination Made Simple
```javascript
const [result] = await aggregator(Model, AggregationOptions)
    .paginate({ page: 1, perPage: 5 })
    .exec();
```
### Create Macros For Reuseability
```javascript
const {aggregator, AggregatorClass} = require('./dist');

AggregatorClass.registerMacro('customProject', () => {
  return new ProjectStage(
      new ProjectBuilder().add('working', true),
  ).build();
});

AggregatorClass.registerMacro('customMatchAndSort', () => {
  return [
    new MatchStage({}).build(),
    new SortStage({
      createdAt: -1
    }).build(),
    new ProjectStage(
        new ProjectBuilder().add("companyName", 1)
    ).build()
  ];
});

const [result] = await aggregator(Model).useMacro('customMatchAndSort').
    limit(1).exec();
```

### Using condition
```javascript

const result = await aggregator(Model).
    match({isActive: true}).
    cond(true, b => b.match({role: 'admin'})).
    exec();

const result = await aggregator(Model).
    match({isActive: true}).
    cond(false, b => b.match({role: 'admin'})).
    exec();

const result = await aggregator(Model)
.cond(() => true, b => b.limit(5)).exec();

const result = await 
    aggregator(Model).cond(() => false, b => b.limit(5)).exec();
```

### Nested Condition
```javascript

const result = await aggregator(Model)
.cond(
    true,
    (agg) => 
        agg.cond(true, (nestAgg) => nestAgg.match({isActive: true})
    )
)
```

### Macros With Arguments
```javascript
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
```

## 📚 API Overview
### Builders
- ProjectBuilder
- GroupBuilder
- LookupBuilder
- UnwindBuilder
- FacetBuilder
- UnionWithBuilder
- (More to Come soon)

### Stages
- AddFields
- MatchStage
- ProjectStage
- GroupStage
- SortStage
- LimitStage
- LookupStage
- UnwindStage
- FacetStage
- UnionWithStage
- (More to Come soon)

### Operators
- $Map
- $Filter
- $Cond
- $Reduce
- $Switch
- (More to Come soon)

### Stage Helpers
- dateRange

## 🧠 Inspiration
Inspired by the repetitive nature of writing MongoDB pipelines manually and the desire for a more readable, chainable syntax in JavaScript.

# 📄 License
MIT License