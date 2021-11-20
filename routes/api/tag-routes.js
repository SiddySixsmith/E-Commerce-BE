const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({include: {model: Product, through: ProductTag, as: "products_tagged"}});
    res.status(200).json(tagData);
  } catch (err){
    res.status(500).json(err)
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try{
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{model:Product, through: ProductTag, as: "products_tagged"}],
    });
    if (!tagData){
      res.status(404).json({message: "No Tag exists with this ID"});
    }
    res.status(200).json(tagData);
  } catch(err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create(req.body)
  .then((tag) => {
    // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.productIds) {
      const productTagIdArr = req.body.productIds.map((product_id) => {
        return {
          tag_id: tag.id,
          product_id,
        };
      });
      return ProductTag.bulkCreate(productTagIdArr);
    }
    // if no product tags, just respond
    res.status(200).json(tag);
  })
  .then((tagIds) => res.status(200).json(tagIds))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(
    req.body, { where: { id: req.params.id } }
  )
    .then(tagData => {
      if (!tagData[0]) {
        res.status(404).json({ message: 'No tag found with this id!' });
        return;
      }
      res.json(tagData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
});
});


router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
  const tagData = await Tag.destroy({
    where: {
      id: req.params.id
    }
  });
  if(!tagData){
    res.status(404).json({message: "No Tag exists with this ID"})
  }
  res.status(200).json(tagData);
}catch (err){
  res.status(500).json(err);
}
});

module.exports = router;
