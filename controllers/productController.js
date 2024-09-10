const { ObjectId } = require('mongodb');

class ProductController {
  constructor(db) {
    this.collection = db.collection('products');
  }

  async createProduct(req, res) {
    try {
      const { ProductName, ProductCode, HSNCode, variants } = req.body;

      // Generate all possible variant combinations
      const variantCombinations = this.generateVariantCombinations(variants);

      const product = {
        ProductName,
        ProductCode,
        HSNCode,
        variants,
        variantStock: variantCombinations.map(combo => ({
          combination: combo,
          stock: 0
        })),
        TotalStock: 0,
        CreatedDate: new Date(),
        Active: true
      };

      const result = await this.collection.insertOne(product);
      res.status(201).json({ id: result.insertedId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  generateVariantCombinations(variants) {
    const combinations = [];
    const variantNames = variants.map(v => v.name);
    const variantOptions = variants.map(v => v.options);

    function generateCombos(current, index) {
      if (index === variantNames.length) {
        combinations.push(current);
        return;
      }

      for (let option of variantOptions[index]) {
        generateCombos({...current, [variantNames[index]]: option}, index + 1);
      }
    }

    generateCombos({}, 0);
    return combinations;
  }

  async listProducts(req, res) {
    try {
      const products = await this.collection.find().toArray();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addStock(req, res) {
    try {
      const { productId, variantCombination, quantity } = req.body;
      const result = await this.collection.updateOne(
        { 
          _id: new ObjectId(productId),
          'variantStock.combination': variantCombination
        },
        { 
          $inc: { 
            'variantStock.$.stock': quantity,
            TotalStock: quantity
          }
        }
      );

      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'Stock added successfully' });
      } else {
        res.status(404).json({ error: 'Product or variant not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async removeStock(req, res) {
    try {
      const { productId, variantCombination, quantity } = req.body;
      const result = await this.collection.updateOne(
        { 
          _id: new ObjectId(productId),
          'variantStock.combination': variantCombination,
          'variantStock.stock': { $gte: quantity }
        },
        { 
          $inc: { 
            'variantStock.$.stock': -quantity,
            TotalStock: -quantity
          }
        }
      );

      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'Stock removed successfully' });
      } else {
        res.status(404).json({ error: 'Product or variant not found, or insufficient stock' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductController;