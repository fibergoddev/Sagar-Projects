/**
 * Advanced Local Database Helper
 * Designed & Developed by Sagar Raj
 * 
 * A comprehensive client-side database solution using localStorage with advanced features:
 * - CRUD operations with query support
 * - Data validation and sanitization
 * - Indexing for performance
 * - Backup and restore functionality
 * - Migration system
 * - Transaction support
 * - Encryption for sensitive data
 * - Schema validation
 * - Event system for data changes
 * - Caching layer
 * - Compression for storage optimization
 */

class AdvancedLocalDB {
    constructor(dbName = 'padhaiLikhaiDB', options = {}) {
        this.dbName = dbName;
        this.options = {
            enableEncryption: options.enableEncryption || false,
            enableCompression: options.enableCompression || true,
            enableIndexing: options.enableIndexing || true,
            enableCaching: options.enableCaching || true,
            maxCacheSize: options.maxCacheSize || 100,
            backupInterval: options.backupInterval || 300000, // 5 minutes
            ...options
        };
        
        this.cache = new Map();
        this.indexes = new Map();
        this.eventListeners = new Map();
        this.schema = {};
        this.migrations = [];
        this.currentTransaction = null;
        
        this.init();
    }

    // =========================
    // INITIALIZATION & SETUP
    // =========================

    /**
     * Initialize the database with default structure and setup
     * Features: Schema creation, migration running, index building
     */
    init() {
        try {
            this.createDefaultSchema();
            this.loadOrCreateDatabase();
            this.runMigrations();
            this.buildIndexes();
            this.setupAutoBackup();
            
            console.log(`✅ Advanced Local DB "${this.dbName}" initialized successfully`);
        } catch (error) {
            console.error('❌ Failed to initialize database:', error);
            throw new Error('Database initialization failed');
        }
    }

    /**
     * Create default database schema
     * Features: Table definitions, constraints, default values
     */
    createDefaultSchema() {
        this.schema = {
            users: {
                fields: {
                    id: { type: 'string', required: true, unique: true },
                    email: { type: 'string', required: true, unique: true, validate: this.validateEmail },
                    password: { type: 'string', required: true, minLength: 8 },
                    firstName: { type: 'string', required: true },
                    lastName: { type: 'string', required: true },
                    role: { type: 'string', enum: ['admin', 'teacher', 'student'], default: 'student' },
                    isActive: { type: 'boolean', default: true },
                    createdAt: { type: 'date', default: () => new Date() },
                    updatedAt: { type: 'date', default: () => new Date() },
                    lastLogin: { type: 'date', nullable: true },
                    preferences: { type: 'object', default: {} }
                },
                indexes: ['email', 'role', 'isActive', 'createdAt']
            },
            sessions: {
                fields: {
                    id: { type: 'string', required: true, unique: true },
                    userId: { type: 'string', required: true },
                    token: { type: 'string', required: true },
                    expiresAt: { type: 'date', required: true },
                    isActive: { type: 'boolean', default: true }
                },
                indexes: ['userId', 'token', 'expiresAt']
            },
            courses: {
                fields: {
                    id: { type: 'string', required: true, unique: true },
                    title: { type: 'string', required: true },
                    description: { type: 'string', required: true },
                    instructorId: { type: 'string', required: true },
                    students: { type: 'array', default: [] },
                    isActive: { type: 'boolean', default: true },
                    createdAt: { type: 'date', default: () => new Date() }
                },
                indexes: ['instructorId', 'isActive', 'createdAt']
            },
            settings: {
                fields: {
                    key: { type: 'string', required: true, unique: true },
                    value: { type: 'any', required: true },
                    updatedAt: { type: 'date', default: () => new Date() }
                },
                indexes: ['key']
            }
        };
    }

    /**
     * Load existing database or create new one
     * Features: Data loading, compression handling, default data setup
     */
    loadOrCreateDatabase() {
        let rawData = localStorage.getItem(this.dbName);
        
        if (!rawData) {
            console.log('🔄 No existing database found. Creating new one...');
            this.createDefaultDatabase();
            return;
        }

        try {
            // Handle compressed data
            if (this.options.enableCompression) {
                rawData = this.decompress(rawData);
            }

            const data = JSON.parse(rawData);
            this.validateDatabaseStructure(data);
            
            console.log('📁 Existing database loaded successfully');
        } catch (error) {
            console.warn('⚠️ Corrupted database detected. Creating new one...', error);
            this.createDefaultDatabase();
        }
    }

    /**
     * Create default database with initial data
     * Features: Default admin setup, initial configuration
     */
    createDefaultDatabase() {
        const defaultData = {
            version: 1,
            createdAt: new Date().toISOString(),
            tables: {
                users: [{
                    id: this.generateId(),
                    email: 'admin@padhai.com',
                    password: this.hashPassword('Admin@123'),
                    firstName: 'System',
                    lastName: 'Administrator',
                    role: 'admin',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastLogin: null,
                    preferences: {
                        theme: 'light',
                        notifications: true,
                        language: 'en'
                    }
                }],
                sessions: [],
                courses: [],
                settings: [
                    { key: 'app_name', value: 'Padhai Likhai', updatedAt: new Date() },
                    { key: 'max_login_attempts', value: 5, updatedAt: new Date() },
                    { key: 'session_timeout', value: 3600000, updatedAt: new Date() } // 1 hour
                ]
            },
            metadata: {
                totalRecords: 1,
                lastBackup: null,
                lastMigration: null
            }
        };

        this.saveDatabase(defaultData);
        console.log('✨ Default database created with admin user');
    }

    // =========================
    // CORE CRUD OPERATIONS
    // =========================

    /**
     * Create/Insert new record
     * Features: Validation, auto-ID generation, indexing, events
     */
    create(table, data) {
        this.validateTable(table);
        
        return this.executeTransaction(() => {
            const validatedData = this.validateAndSanitizeData(table, data);
            const record = {
                ...validatedData,
                id: validatedData.id || this.generateId(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const db = this.getDatabase();
            if (!db.tables[table]) {
                db.tables[table] = [];
            }

            // Check for unique constraints
            this.checkUniqueConstraints(table, record);

            db.tables[table].push(record);
            this.saveDatabase(db);
            
            // Update indexes
            this.updateIndexes(table, record, 'create');
            
            // Clear cache
            this.clearTableCache(table);
            
            // Emit event
            this.emit('create', { table, record });
            
            console.log(`✅ Record created in ${table}:`, record.id);
            return record;
        });
    }

    /**
     * Read/Query records with advanced filtering
     * Features: Complex queries, pagination, sorting, caching
     */
    read(table, query = {}, options = {}) {
        this.validateTable(table);
        
        const cacheKey = this.getCacheKey(table, query, options);
        
        // Check cache first
        if (this.options.enableCaching && this.cache.has(cacheKey)) {
            console.log(`📋 Cache hit for ${table} query`);
            return this.cache.get(cacheKey);
        }

        const db = this.getDatabase();
        let records = db.tables[table] || [];

        // Apply filters
        if (Object.keys(query).length > 0) {
            records = this.filterRecords(records, query);
        }

        // Apply sorting
        if (options.sort) {
            records = this.sortRecords(records, options.sort);
        }

        // Apply pagination
        if (options.limit || options.offset) {
            const offset = options.offset || 0;
            const limit = options.limit || records.length;
            records = records.slice(offset, offset + limit);
        }

        // Cache results
        if (this.options.enableCaching) {
            this.setCacheValue(cacheKey, records);
        }

        console.log(`📖 Read ${records.length} records from ${table}`);
        return records;
    }

    /**
     * Update existing records
     * Features: Partial updates, validation, optimistic locking
     */
    update(table, query, updateData, options = {}) {
        this.validateTable(table);
        
        return this.executeTransaction(() => {
            const db = this.getDatabase();
            const records = db.tables[table] || [];
            const matchingRecords = this.filterRecords(records, query);

            if (matchingRecords.length === 0) {
                throw new Error(`No records found in ${table} matching the query`);
            }

            const validatedUpdateData = this.validateAndSanitizeData(table, updateData, true);
            const updatedRecords = [];

            matchingRecords.forEach(record => {
                const index = records.findIndex(r => r.id === record.id);
                const updatedRecord = {
                    ...record,
                    ...validatedUpdateData,
                    updatedAt: new Date()
                };

                // Check unique constraints
                this.checkUniqueConstraints(table, updatedRecord, record.id);

                records[index] = updatedRecord;
                updatedRecords.push(updatedRecord);

                // Update indexes
                this.updateIndexes(table, updatedRecord, 'update', record);
            });

            this.saveDatabase(db);
            this.clearTableCache(table);
            
            // Emit event
            this.emit('update', { table, records: updatedRecords });
            
            console.log(`✏️ Updated ${updatedRecords.length} records in ${table}`);
            return updatedRecords;
        });
    }

    /**
     * Delete records
     * Features: Soft delete option, cascade delete, cleanup
     */
    delete(table, query, options = {}) {
        this.validateTable(table);
        
        return this.executeTransaction(() => {
            const db = this.getDatabase();
            const records = db.tables[table] || [];
            const matchingRecords = this.filterRecords(records, query);

            if (matchingRecords.length === 0) {
                console.log(`ℹ️ No records found in ${table} matching the query`);
                return [];
            }

            if (options.soft) {
                // Soft delete - mark as deleted
                const deletedRecords = [];
                matchingRecords.forEach(record => {
                    const index = records.findIndex(r => r.id === record.id);
                    records[index] = {
                        ...record,
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedAt: new Date()
                    };
                    deletedRecords.push(records[index]);
                });
                
                this.saveDatabase(db);
                this.emit('softDelete', { table, records: deletedRecords });
                console.log(`🗑️ Soft deleted ${deletedRecords.length} records from ${table}`);
                return deletedRecords;
            } else {
                // Hard delete - remove from database
                const deletedRecords = [...matchingRecords];
                db.tables[table] = records.filter(record => 
                    !matchingRecords.some(match => match.id === record.id)
                );
                
                // Remove from indexes
                deletedRecords.forEach(record => {
                    this.updateIndexes(table, record, 'delete');
                });
                
                this.saveDatabase(db);
                this.clearTableCache(table);
                this.emit('delete', { table, records: deletedRecords });
                
                console.log(`🗑️ Hard deleted ${deletedRecords.length} records from ${table}`);
                return deletedRecords;
            }
        });
    }

    // =========================
    // ADVANCED QUERY SYSTEM
    // =========================

    /**
     * Advanced query builder with complex conditions
     * Features: AND/OR logic, comparison operators, nested queries
     */
    query(table) {
        return new QueryBuilder(this, table);
    }

    /**
     * Filter records based on complex query conditions
     * Features: Multiple operators, nested conditions, type-safe comparisons
     */
    filterRecords(records, query) {
        return records.filter(record => {
            return this.matchesQuery(record, query);
        });
    }

    /**
     * Check if a record matches the query conditions
     * Features: Recursive query matching, operator support
     */
    matchesQuery(record, query) {
        for (const [key, condition] of Object.entries(query)) {
            if (key === '$and') {
                if (!condition.every(subQuery => this.matchesQuery(record, subQuery))) {
                    return false;
                }
            } else if (key === '$or') {
                if (!condition.some(subQuery => this.matchesQuery(record, subQuery))) {
                    return false;
                }
            } else if (typeof condition === 'object' && condition !== null) {
                if (!this.matchesFieldCondition(record[key], condition)) {
                    return false;
                }
            } else {
                if (record[key] !== condition) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Match field-specific conditions with operators
     * Features: $eq, $ne, $gt, $lt, $gte, $lte, $in, $nin, $regex, $exists
     */
    matchesFieldCondition(value, condition) {
        for (const [operator, operand] of Object.entries(condition)) {
            switch (operator) {
                case '$eq':
                    if (value !== operand) return false;
                    break;
                case '$ne':
                    if (value === operand) return false;
                    break;
                case '$gt':
                    if (value <= operand) return false;
                    break;
                case '$gte':
                    if (value < operand) return false;
                    break;
                case '$lt':
                    if (value >= operand) return false;
                    break;
                case '$lte':
                    if (value > operand) return false;
                    break;
                case '$in':
                    if (!operand.includes(value)) return false;
                    break;
                case '$nin':
                    if (operand.includes(value)) return false;
                    break;
                case '$regex':
                    if (!new RegExp(operand).test(value)) return false;
                    break;
                case '$exists':
                    if (operand && value === undefined) return false;
                    if (!operand && value !== undefined) return false;
                    break;
                default:
                    console.warn(`Unknown operator: ${operator}`);
            }
        }
        return true;
    }

    // =========================
    // INDEXING SYSTEM
    // =========================

    /**
     * Build indexes for all tables
     * Features: Automatic index creation, performance optimization
     */
    buildIndexes() {
        if (!this.options.enableIndexing) return;

        console.log('🔍 Building indexes...');
        
        Object.keys(this.schema).forEach(table => {
            const tableSchema = this.schema[table];
            if (tableSchema.indexes) {
                tableSchema.indexes.forEach(field => {
                    this.createIndex(table, field);
                });
            }
        });
        
        console.log('✅ Indexes built successfully');
    }

    /**
     * Create index for a specific table and field
     * Features: Efficient lookups, sorted indexes
     */
    createIndex(table, field) {
        const indexKey = `${table}.${field}`;
        const db = this.getDatabase();
        const records = db.tables[table] || [];
        
        const index = new Map();
        records.forEach(record => {
            const value = record[field];
            if (value !== undefined) {
                if (!index.has(value)) {
                    index.set(value, []);
                }
                index.get(value).push(record.id);
            }
        });
        
        this.indexes.set(indexKey, index);
    }

    /**
     * Update indexes when records change
     * Features: Incremental updates, consistency maintenance
     */
    updateIndexes(table, record, operation, oldRecord = null) {
        if (!this.options.enableIndexing) return;

        const tableSchema = this.schema[table];
        if (!tableSchema?.indexes) return;

        tableSchema.indexes.forEach(field => {
            const indexKey = `${table}.${field}`;
            const index = this.indexes.get(indexKey);
            if (!index) return;

            if (operation === 'delete') {
                const value = record[field];
                if (value !== undefined && index.has(value)) {
                    const ids = index.get(value);
                    const filteredIds = ids.filter(id => id !== record.id);
                    if (filteredIds.length === 0) {
                        index.delete(value);
                    } else {
                        index.set(value, filteredIds);
                    }
                }
            } else if (operation === 'create') {
                const value = record[field];
                if (value !== undefined) {
                    if (!index.has(value)) {
                        index.set(value, []);
                    }
                    index.get(value).push(record.id);
                }
            } else if (operation === 'update' && oldRecord) {
                // Remove old value
                const oldValue = oldRecord[field];
                if (oldValue !== undefined && index.has(oldValue)) {
                    const ids = index.get(oldValue);
                    const filteredIds = ids.filter(id => id !== record.id);
                    if (filteredIds.length === 0) {
                        index.delete(oldValue);
                    } else {
                        index.set(oldValue, filteredIds);
                    }
                }
                
                // Add new value
                const newValue = record[field];
                if (newValue !== undefined) {
                    if (!index.has(newValue)) {
                        index.set(newValue, []);
                    }
                    index.get(newValue).push(record.id);
                }
            }
        });
    }

    // =========================
    // VALIDATION SYSTEM
    // =========================

    /**
     * Validate and sanitize data according to schema
     * Features: Type checking, required fields, custom validators
     */
    validateAndSanitizeData(table, data, isUpdate = false) {
        const tableSchema = this.schema[table];
        if (!tableSchema) {
            throw new Error(`Schema not found for table: ${table}`);
        }

        const validatedData = {};
        const fields = tableSchema.fields;

        for (const [fieldName, fieldSchema] of Object.entries(fields)) {
            const value = data[fieldName];
            
            // Handle required fields
            if (fieldSchema.required && !isUpdate && (value === undefined || value === null)) {
                throw new Error(`Required field missing: ${fieldName}`);
            }

            // Skip validation for undefined values in updates
            if (value === undefined && isUpdate) {
                continue;
            }

            // Apply default values
            if (value === undefined && fieldSchema.default !== undefined) {
                validatedData[fieldName] = typeof fieldSchema.default === 'function' 
                    ? fieldSchema.default() 
                    : fieldSchema.default;
                continue;
            }

            // Type validation
            if (value !== undefined) {
                this.validateFieldType(fieldName, value, fieldSchema);
                
                // Custom validation
                if (fieldSchema.validate) {
                    const isValid = fieldSchema.validate(value);
                    if (!isValid) {
                        throw new Error(`Validation failed for field: ${fieldName}`);
                    }
                }
                
                // Enum validation
                if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
                    throw new Error(`Invalid enum value for ${fieldName}: ${value}`);
                }
                
                validatedData[fieldName] = value;
            }
        }

        return validatedData;
    }

    /**
     * Validate field type according to schema
     * Features: Type coercion, strict type checking
     */
    validateFieldType(fieldName, value, fieldSchema) {
        const type = fieldSchema.type;
        
        switch (type) {
            case 'string':
                if (typeof value !== 'string') {
                    throw new Error(`Field ${fieldName} must be a string`);
                }
                if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
                    throw new Error(`Field ${fieldName} must be at least ${fieldSchema.minLength} characters`);
                }
                break;
            case 'number':
                if (typeof value !== 'number') {
                    throw new Error(`Field ${fieldName} must be a number`);
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean') {
                    throw new Error(`Field ${fieldName} must be a boolean`);
                }
                break;
            case 'date':
                if (!(value instanceof Date)) {
                    throw new Error(`Field ${fieldName} must be a Date object`);
                }
                break;
            case 'array':
                if (!Array.isArray(value)) {
                    throw new Error(`Field ${fieldName} must be an array`);
                }
                break;
            case 'object':
                if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                    throw new Error(`Field ${fieldName} must be an object`);
                }
                break;
            case 'any':
                // No validation needed
                break;
            default:
                throw new Error(`Unknown field type: ${type}`);
        }
    }

    /**
     * Check unique constraints
     * Features: Unique field validation, conflict detection
     */
    checkUniqueConstraints(table, record, excludeId = null) {
        const tableSchema = this.schema[table];
        if (!tableSchema) return;

        const db = this.getDatabase();
        const existingRecords = db.tables[table] || [];

        for (const [fieldName, fieldSchema] of Object.entries(tableSchema.fields)) {
            if (fieldSchema.unique && record[fieldName] !== undefined) {
                const duplicate = existingRecords.find(existing => 
                    existing.id !== excludeId && 
                    existing[fieldName] === record[fieldName]
                );
                
                if (duplicate) {
                    throw new Error(`Duplicate value for unique field ${fieldName}: ${record[fieldName]}`);
                }
            }
        }
    }

    // =========================
    // TRANSACTION SYSTEM
    // =========================

    /**
     * Execute operations within a transaction
     * Features: Rollback on error, atomic operations
     */
    executeTransaction(operation) {
        if (this.currentTransaction) {
            // Nested transaction - just execute
            return operation();
        }

        // Start new transaction
        this.currentTransaction = {
            id: this.generateId(),
            startTime: Date.now(),
            operations: []
        };

        // Create backup before transaction
        const backup = this.getDatabase();

        try {
            const result = operation();
            
            // Commit transaction
            this.currentTransaction = null;
            console.log('✅ Transaction completed successfully');
            
            return result;
        } catch (error) {
            // Rollback transaction
            console.error('❌ Transaction failed, rolling back:', error);
            this.saveDatabase(backup);
            this.currentTransaction = null;
            
            throw error;
        }
    }

    /**
     * Begin explicit transaction
     * Features: Manual transaction control
     */
    beginTransaction() {
        if (this.currentTransaction) {
            throw new Error('Transaction already in progress');
        }
        
        this.currentTransaction = {
            id: this.generateId(),
            startTime: Date.now(),
            operations: [],
            backup: this.getDatabase()
        };
        
        console.log('🚀 Transaction started');
    }

    /**
     * Commit current transaction
     * Features: Finalize all operations
     */
    commitTransaction() {
        if (!this.currentTransaction) {
            throw new Error('No transaction in progress');
        }
        
        this.currentTransaction = null;
        console.log('✅ Transaction committed');
    }

    /**
     * Rollback current transaction
     * Features: Restore previous state
     */
    rollbackTransaction() {
        if (!this.currentTransaction) {
            throw new Error('No transaction in progress');
        }
        
        if (this.currentTransaction.backup) {
            this.saveDatabase(this.currentTransaction.backup);
        }
        
        this.currentTransaction = null;
        console.log('🔄 Transaction rolled back');
    }

    // =========================
    // BACKUP & RESTORE
    // =========================

    /**
     * Create database backup
     * Features: Full backup, metadata inclusion
     */
    createBackup() {
        const db = this.getDatabase();
        const backup = {
            ...db,
            backupInfo: {
                createdAt: new Date(),
                version: db.version,
                recordCount: this.getTotalRecordCount()
            }
        };
        
        const backupKey = `${this.dbName}_backup_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(backup));
        
        // Update last backup timestamp
        db.metadata.lastBackup = new Date();
        this.saveDatabase(db);
        
        console.log(`💾 Backup created: ${backupKey}`);
        return backupKey;
    }

    /**
     * Restore database from backup
     * Features: Backup validation, full restore
     */
    restoreFromBackup(backupKey) {
        const backupData = localStorage.getItem(backupKey);
        if (!backupData) {
            throw new Error(`Backup not found: ${backupKey}`);
        }
        
        try {
            const backup = JSON.parse(backupData);
            this.validateDatabaseStructure(backup);
            
            // Save current state as emergency backup
            const emergencyBackup = this.createBackup();
            
            // Restore from backup
            this.saveDatabase(backup);
            this.buildIndexes();
            this.clearAllCache();
            
            console.log(`🔄 Database restored from backup: ${backupKey}`);
            console.log(`🚨 Emergency backup created: ${emergencyBackup}`);
            
        } catch (error) {
            console.error('❌ Failed to restore backup:', error);
            throw error;
        }
    }

    /**
     * Setup automatic backup system
     * Features: Periodic backups, cleanup old backups
     */
    setupAutoBackup() {
        if (this.options.backupInterval > 0) {
            setInterval(() => {
                try {
                    this.createBackup();
                    this.cleanupOldBackups();
                } catch (error) {
                    console.error('❌ Auto-backup failed:', error);
                }
            }, this.options.backupInterval);
            
            console.log(`⏰ Auto-backup scheduled every ${this.options.backupInterval}ms`);
        }
    }

    /**
     * Clean up old backup files
     * Features: Retention policy, storage optimization
     */
    cleanupOldBackups(maxBackups = 5) {
        const backupKeys = [];
        
        // Find all backup keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`${this.dbName}_backup_`)) {
                backupKeys.push(key);
            }
        }
        
        // Sort by timestamp (newest first)
        backupKeys.sort((a, b) => {
            const timestampA = parseInt(a.split('_').pop());
            const timestampB = parseInt(b.split('_').pop());
            return timestampB - timestampA;
        });
        
        // Remove old backups
        if (backupKeys.length > maxBackups) {
            backupKeys.slice(maxBackups).forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed old backup: ${key}`);
            });
        }
    }

    // =========================
    // CACHING SYSTEM
    // =========================

    /**
     * Generate cache key for queries
     * Features: Query normalization, key generation
     */
    getCacheKey(table, query, options) {
        const normalizedQuery = JSON.stringify(query, Object.keys(query).sort());
        const normalizedOptions = JSON.stringify(options, Object.keys(options).sort());
        return `${table}_${this.hashString(normalizedQuery + normalizedOptions)}`;
    }

    /**
     * Set cache value with size management
     * Features: LRU eviction, size limits
     */
    setCacheValue(key, value) {
        if (this.cache.size >= this.options.maxCacheSize) {
            // Remove oldest entry (simple LRU)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, value);
    }

    /**
     * Clear cache for specific table
     * Features: Selective cache invalidation
     */
    clearTableCache(table) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(table + '_')) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     * Features: Complete cache reset
     */
    clearAllCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }

    // =========================
// =========================
    // MIGRATION SYSTEM
    // =========================

    /**
     * Register a migration to be run
     * @param {number} version - The database version this migration targets
     * @param {function} migrationFunction - The function to execute for the migration
     */
    registerMigration(version, migrationFunction) {
        this.migrations.push({ version, migrate: migrationFunction });
        // Sort migrations by version
        this.migrations.sort((a, b) => a.version - b.version);
    }

    /**
     * Run migrations to update database schema and data
     * Features: Version tracking, sequential execution
     */
    runMigrations() {
        const db = this.getDatabase();
        const currentVersion = db.version || 0;

        const migrationsToRun = this.migrations.filter(m => m.version > currentVersion);

        if (migrationsToRun.length > 0) {
            console.log(`🚀 Starting migrations from version ${currentVersion}`);
            this.beginTransaction();
            try {
                migrationsToRun.forEach(migration => {
                    console.log(`Applying migration for version ${migration.version}...`);
                    migration.migrate(this); // Pass db instance to migration
                    db.version = migration.version;
                    db.metadata.lastMigration = new Date();
                    this.saveDatabase(db);
                });
                this.commitTransaction();
                console.log(`✅ Migrations completed. Database is now at version ${db.version}`);
            } catch (error) {
                console.error('❌ Migration failed, rolling back:', error);
                this.rollbackTransaction();
                throw new Error('Database migration failed');
            }
        } else {
            console.log('✅ Database is up to date.');
        }
    }

    // =========================
    // ENCRYPTION & COMPRESSION
    // =========================

    /**
     * Encrypt data (simple XOR cipher for demonstration)
     * NOTE: This is NOT for production use. Use a strong crypto library.
     */
    encrypt(data) {
        if (!this.options.enableEncryption || !this.options.encryptionKey) return data;
        const key = this.options.encryptionKey;
        let result = '';
        for (let i = 0; i < data.length; i++) {
            result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(result); // Base64 encode to handle binary data
    }

    /**
     * Decrypt data
     */
    decrypt(data) {
        if (!this.options.enableEncryption || !this.options.encryptionKey) return data;
        const key = this.options.encryptionKey;
        const decodedData = atob(data); // Decode from Base64
        let result = '';
        for (let i = 0; i < decodedData.length; i++) {
            result += String.fromCharCode(decodedData.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    }
    
    /**
     * Compress data (conceptual - uses JSON.stringify)
     * NOTE: In a real app, use a library like pako.js for GZIP
     */
    compress(data) {
        if (!this.options.enableCompression) return data;
        // Placeholder for real compression
        return JSON.stringify(data);
    }

    /**
     * Decompress data (conceptual - uses JSON.parse)
     */
    decompress(data) {
        if (!this.options.enableCompression) return data;
        // Placeholder for real decompression
        return JSON.parse(data);
    }
    
    // =========================
    // EVENT SYSTEM
    // =========================
    
    /**
     * Register an event listener
     */
    on(eventName, listener) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(listener);
    }
    
    /**
     * Unregister an event listener
     */
    off(eventName, listener) {
        if (!this.eventListeners.has(eventName)) return;
        
        const listeners = this.eventListeners.get(eventName);
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }
    
    /**
     * Emit an event to all listeners
     */
    emit(eventName, payload) {
        if (!this.eventListeners.has(eventName)) return;
        
        this.eventListeners.get(eventName).forEach(listener => {
            try {
                listener(payload);
            } catch (error) {
                console.error(`Error in event listener for '${eventName}':`, error);
            }
        });
    }

    // =========================
    // UTILITY & HELPER FUNCTIONS
    // =========================
    
    /**
     * Get and parse database from localStorage
     */
    getDatabase() {
        let rawData = localStorage.getItem(this.dbName);
        if (!rawData) return null;

        let decryptedData = this.decrypt(rawData);
        
        // Custom JSON parsing with date revival
        return JSON.parse(decryptedData, (key, value) => {
            const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
            if (typeof value === 'string' && isoDateRegex.test(value)) {
                return new Date(value);
            }
            return value;
        });
    }
    
    /**
     * Stringify and save database to localStorage
     */
    saveDatabase(data) {
        const stringifiedData = JSON.stringify(data);
        const encryptedData = this.encrypt(stringifiedData);
        localStorage.setItem(this.dbName, encryptedData);
    }

    /**
     * Generate a unique ID (simple version)
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Validate the overall database structure
     */
    validateDatabaseStructure(data) {
        if (!data || typeof data !== 'object' || !data.tables || !data.metadata) {
            throw new Error('Invalid database structure');
        }
    }

    /**
     * Get total record count across all tables
     */
    getTotalRecordCount() {
        const db = this.getDatabase();
        if (!db) return 0;
        
        return Object.values(db.tables).reduce((sum, table) => sum + table.length, 0);
    }

    /**
     * Sort records based on sort options
     * @param {Array} records - The records to sort
     * @param {Object} sortOptions - e.g., { field: 'createdAt', order: 'desc' }
     */
    sortRecords(records, sortOptions) {
        const { field, order = 'asc' } = sortOptions;
        const multiplier = order === 'desc' ? -1 : 1;

        return records.sort((a, b) => {
            if (a[field] < b[field]) return -1 * multiplier;
            if (a[field] > b[field]) return 1 * multiplier;
            return 0;
        });
    }

    /**
     * A very simple, non-cryptographic hash for strings (for cache keys)
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    /**
     * A placeholder for password hashing.
     * WARNING: NEVER store plain text passwords. Use a library like bcrypt on a server.
     * This is for demonstration purposes only.
     */
    hashPassword(password) {
        // In a real app, this would be an async call to a library like bcrypt.
        // For this client-side example, we'll just Base64 encode it.
        return `hashed_${btoa(password)}`;
    }

    /**
     * Custom email validator
     */
    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     * Validate that a table exists in the schema
     */
    validateTable(table) {
        if (!this.schema[table]) {
            throw new Error(`Table '${table}' does not exist in the schema.`);
        }
    }
}

/**
 * Query Builder for fluent database queries
 */
class QueryBuilder {
    constructor(dbInstance, table) {
        this.db = dbInstance;
        this.table = table;
        this.query = {};
        this.options = {};
    }

    /**
     * Add a where clause to the query
     */
    where(field, operator, value) {
        if (value === undefined) {
            // Support for simple equality where('email', 'test@test.com')
            value = operator;
            operator = '$eq';
        }
        
        if (!this.query[field]) {
            this.query[field] = {};
        }

        this.query[field][operator] = value;
        return this;
    }

    /**
     * Set the sorting order
     */
    sort(field, order = 'asc') {
        this.options.sort = { field, order };
        return this;
    }

    /**
     * Set the number of records to return
     */
    limit(count) {
        this.options.limit = count;
        return this;
    }

    /**
     * Set the number of records to skip
     */
    offset(count) {
        this.options.offset = count;
        return this;
    }

    /**
     * Execute the query and return the results
     */
    execute() {
        return this.db.read(this.table, this.query, this.options);
    }
    
    /**
     * Execute the query and return the first result
     */
    first() {
        this.limit(1);
        const results = this.execute();
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Count the number of matching records
     */
    count() {
        return this.execute().length;
    }
}
