import { products, type Product, type InsertProduct, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product storage methods
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(barcode: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<string, Product>;
  private currentUserId: number;
  private currentProductId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return this.products.get(barcode);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      lastUpdated: new Date().toISOString()
    };
    this.products.set(insertProduct.barcode, product);
    return product;
  }

  async updateProduct(barcode: string, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(barcode);
    if (!existingProduct) return undefined;

    const updatedProduct: Product = {
      ...existingProduct,
      ...productUpdate,
      lastUpdated: new Date().toISOString()
    };
    this.products.set(barcode, updatedProduct);
    return updatedProduct;
  }
}

export const storage = new MemStorage();
