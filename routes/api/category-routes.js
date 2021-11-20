const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Categorys
  try {
    const categoryData = await Category.findAll({ include: [{model: Product }]});
    res.status(200).json(categoryData);     
  } catch (err){
    res.status(500).json(err)
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Categorys
  try{
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{model: Product }]
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
      if (req.body.productIds) {
        const categoryProductIdArr = req.body.productIds.map((product_id) => {
          return {
            category_id: category.id,
            product_id,
          };
        });
        return categoryTag.bulkCreate(categoryProductIdArr);
      }
      // if no Category tags, just respond
      res.status(200).json(category);
    })
    .then((categoryProductIds) => res.status(200).json(categoryProductIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  Category.update(
    req.body, { where: { id: req.params.id } }
  )
    .then(categoryData => {
      if (!categoryData[0]) {
        res.status(404).json({ message: 'No category found with this id!' });
        return;
      }
      res.json(categoryData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/:id', async (req, res) => {
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
