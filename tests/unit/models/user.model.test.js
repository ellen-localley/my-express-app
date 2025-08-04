const mongoose = require('mongoose');
const User = require('../../../src/models/user.model');

describe('User Model Test', () => {
  it('should create a user successfully', async () => {
    const validUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };
    
    const newUser = new User(validUser);
    const savedUser = await newUser.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.name).toBe(validUser.name);
    expect(savedUser.role).toBe('user');
    expect(savedUser.isActive).toBe(true);
  });

  it('should fail to create user without required fields', async () => {
    const userWithoutRequiredField = new User({ email: 'test@example.com' });
    
    let err;
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.password).toBeDefined();
    expect(err.errors.name).toBeDefined();
  });

  it('should fail with invalid email format', async () => {
    const userWithInvalidEmail = new User({
      email: 'invalid-email',
      password: 'password123',
      name: 'Test User'
    });
    
    let err;
    try {
      await userWithInvalidEmail.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });

  it('should remove password from JSON output', () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    
    const userJson = user.toJSON();
    
    expect(userJson.password).toBeUndefined();
    expect(userJson.email).toBeDefined();
  });

  it('should have timestamps', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    
    const savedUser = await user.save();
    
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });
});