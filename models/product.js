const { ObjectId } = require('mongodb');

class Product {
  constructor(db) {
    this.collection = db.collection('products');
  }

  async create(productData) {
    const product = {
      ...productData,
      ProductID: await this.getNextProductID(),
      ProductCode: this.generateProductCode(),
      CreatedDate: new Date(),
      Active: true,
      TotalStock: 0,
    };
    const result = await this.collection.insertOne(product);
    return result.insertedId;
  }

  async list() {
    return this.collection.find({ Active: true }).toArray();
  }

  async addStock(productId, variantId, quantity) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(productId), 'variants._id': new ObjectId(variantId) },
      { 
        $inc: { 
          TotalStock: quantity,
          'variants.$.stock': quantity 
        }
      }
    );
    return result.modifiedCount > 0;
  }

  async removeStock(productId, variantId, quantity) {
    const result = await this.collection.updateOne(
      { 
        _id: new ObjectId(productId), 
        'variants._id': new ObjectId(variantId),
        'variants.stock': { $gte: quantity }
      },
      { 
        $inc: { 
          TotalStock: -quantity,
          'variants.$.stock': -quantity 
        }
      }
    );
    return result.modifiedCount > 0;
  }

  async getNextProductID() {
    const lastProduct = await this.collection.findOne({}, { sort: { ProductID: -1 } });
    return lastProduct ? lastProduct.ProductID + 1 : 1;
  }

  generateProductCode() {
    return 'P' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}

module.exports = Product;