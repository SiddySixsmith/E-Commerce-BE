const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', (req, res) => {
  // find all categories
  // be sure to include its associated Categorys
  try {
    const categoryData = await Category.findAll({ include: [{model: Product }]});
    res.status(200).json(CategoryData);
  } catch (err){
    res.status(500).json(err)
  }
});

router.get('/:id', (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Categorys
  try{
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{model: Category }]
    });
    if (!categoryData){
      res.status(404).json({message: "No Category exists with this ID"});
    }
    res.status(200).json(categoryData);
  } catch(err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  Category.create(req.body)
    .then((category) => {
      // if there's Category tags, we need to create pairings to bulk create in the CategoryTag model
      if (req.body.productIds.length) {
        const categoryProductIdArr = req.body.productIds.map((product_id) => {
          return {
            category_id: category.id,
            product_id,
          };
        });
        return categoryTag.bulkCreate(categoryProductIdArr);
      }
      // if no Category tags, just respond
      res.status(200).json(Category);
    })
    .then((categoryProductIds) => res.status(200).json(categoryProductIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((category) => {
      // find all associated tags from CategoryTag
      return categoryProduct.findAll({ where: { category_id: req.params.id } });
    })
    .then((categoryProducts) => {
      // get list of current tag_ids
      const categoryTagIds = categoryProducts.map(({ product_id }) => product_id);
      // create filtered list of new tag_ids
      const newCategoryTags = req.body.productIds
        .filter((product_id) => !categoryTagIds.includes(product_id))
        .map((product_id) => {
          return {
            category_id: req.params.id,
            product_id,
          };
        });
      // figure out which ones to remove
      const categoryProductsToRemove = categoryProducts
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        categoryProducts.destroy({ where: { id: categoryProductsToRemove } }),
        categoryProducts.bulkCreate(newCategoryTags),
      ]);
    })
    .then((updatedCategoryProducts) => res.json(updatedCategoryProducts))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id
      }
    });
    if(!categoryData){
      res.status(404).json({message: "No Category exists with this ID"})
    }
    res.status(200).json(categoryData);
  }catch (err){
    res.status(500).json(err);
  }
});

module.exports = router;
