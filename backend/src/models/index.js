const sequelize = require("../config/db");
const User = require("./User");
const Ticket = require("./Ticket");
const Comment = require("./Comment");

// A ticket is created by an employee (reporter)
Ticket.belongsTo(User, { as: "reporter", foreignKey: "reporterId" });
User.hasMany(Ticket, { as: "reportedTickets", foreignKey: "reporterId" });

// A ticket can be assigned to an IT staff member
Ticket.belongsTo(User, { as: "assignee", foreignKey: "assigneeId" });
User.hasMany(Ticket, { as: "assignedTickets", foreignKey: "assigneeId" });

// Comments belong to a ticket and are authored by a user
Comment.belongsTo(Ticket, { foreignKey: "ticketId", onDelete: "CASCADE" });
Ticket.hasMany(Comment, { as: "comments", foreignKey: "ticketId", onDelete: "CASCADE" });

Comment.belongsTo(User, { as: "author", foreignKey: "userId" });
User.hasMany(Comment, { as: "comments", foreignKey: "userId" });

// MOCKED — in-memory fallback because MySQL TCP connections are unavailable in AI Studio
const useMock = true;

if (useMock) {
  console.warn("[AI Studio] Database not connected — using in-memory mock store");

  const stores = {
    User: [],
    Ticket: [],
    Comment: [],
  };
  const counters = {
    User: 1,
    Ticket: 1,
    Comment: 1,
  };

  function matchWhere(item, where) {
    if (!where) return true;
    for (const key of Reflect.ownKeys(where)) {
      const val = where[key];
      if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        for (const opKey of Reflect.ownKeys(val)) {
          const opName = String(opKey);
          const opVal = val[opKey];
          if (opName.includes("gte")) {
            if (!(new Date(item[key]) >= new Date(opVal))) return false;
          } else if (opName.includes("lte")) {
            if (!(new Date(item[key]) <= new Date(opVal))) return false;
          }
        }
      } else {
        if (item[key] != val) return false;
      }
    }
    return true;
  }

  function wrapRecord(tableName, rawData) {
    const record = { ...rawData };
    Object.defineProperty(record, "save", {
      enumerable: false,
      value: async function () {
        record.updatedAt = new Date();
        const idx = stores[tableName].findIndex((r) => r.id == record.id);
        if (idx !== -1) {
          stores[tableName][idx] = { ...record };
        }
        return record;
      },
    });
    Object.defineProperty(record, "destroy", {
      enumerable: false,
      value: async function () {
        const idx = stores[tableName].findIndex((r) => r.id == record.id);
        if (idx !== -1) {
          stores[tableName].splice(idx, 1);
        }
      },
    });
    return record;
  }

  function applyIncludeAndAttrs(tableName, rawItem, options = {}) {
    if (!rawItem) return null;
    const item = wrapRecord(tableName, rawItem);

    if (options.include && Array.isArray(options.include)) {
      for (const inc of options.include) {
        if (inc.as === "reporter") {
          const u = stores.User.find((x) => x.id == item.reporterId) || null;
          item.reporter = u ? pickAttrs(u, inc.attributes) : null;
        } else if (inc.as === "assignee") {
          const u = stores.User.find((x) => x.id == item.assigneeId) || null;
          item.assignee = u ? pickAttrs(u, inc.attributes) : null;
        } else if (inc.as === "author") {
          const u = stores.User.find((x) => x.id == item.userId) || null;
          item.author = u ? pickAttrs(u, inc.attributes) : null;
        }
      }
    }

    if (options.attributes && Array.isArray(options.attributes)) {
      return pickAttrs(item, options.attributes, true);
    }
    return item;
  }

  function pickAttrs(obj, attrs, keepMethods = false) {
    if (!attrs || !Array.isArray(attrs)) return { ...obj };
    const res = {};
    for (const a of attrs) {
      if (a in obj) res[a] = obj[a];
    }
    if (obj.reporter !== undefined) res.reporter = obj.reporter;
    if (obj.assignee !== undefined) res.assignee = obj.assignee;
    if (obj.author !== undefined) res.author = obj.author;
    if (keepMethods && obj.save) {
      Object.defineProperty(res, "save", { enumerable: false, value: obj.save });
      Object.defineProperty(res, "destroy", { enumerable: false, value: obj.destroy });
    }
    return res;
  }

  function createMockModel(tableName, defaults = {}) {
    return {
      findOne: async (options = {}) => {
        const found = stores[tableName].find((item) => matchWhere(item, options.where));
        return found ? applyIncludeAndAttrs(tableName, found, options) : null;
      },
      findByPk: async (id, options = {}) => {
        const found = stores[tableName].find((item) => item.id == id);
        return found ? applyIncludeAndAttrs(tableName, found, options) : null;
      },
      findAll: async (options = {}) => {
        let list = stores[tableName].filter((item) => matchWhere(item, options.where));
        if (options.order && Array.isArray(options.order) && options.order.length > 0) {
          const [field, dir] = options.order[0];
          list = [...list].sort((a, b) => {
            const va = a[field];
            const vb = b[field];
            if (va < vb) return dir === "DESC" ? 1 : -1;
            if (va > vb) return dir === "DESC" ? -1 : 1;
            return 0;
          });
        }
        return list.map((item) => applyIncludeAndAttrs(tableName, item, options));
      },
      create: async (data = {}) => {
        const now = new Date();
        const record = {
          ...defaults,
          ...data,
          id: counters[tableName]++,
          createdAt: data.createdAt || now,
          updatedAt: data.updatedAt || now,
        };
        stores[tableName].push(record);
        return wrapRecord(tableName, record);
      },
      count: async (options = {}) => {
        return stores[tableName].filter((item) => matchWhere(item, options.where)).length;
      },
      update: async (values = {}, options = {}) => {
        let count = 0;
        stores[tableName].forEach((item, idx) => {
          if (matchWhere(item, options.where)) {
            stores[tableName][idx] = { ...item, ...values, updatedAt: new Date() };
            count++;
          }
        });
        return [count];
      },
      destroy: async (options = {}) => {
        const before = stores[tableName].length;
        stores[tableName] = stores[tableName].filter((item) => !matchWhere(item, options.where));
        return before - stores[tableName].length;
      },
    };
  }

  const mockSequelize = {
    authenticate: async () => true,
    sync: async () => true,
  };

  module.exports = {
    sequelize: mockSequelize,
    User: createMockModel("User", { role: "employee", office: null }),
    Ticket: createMockModel("Ticket", {
      priority: "medium",
      status: "open",
      resolutionNotes: null,
      attachmentUrl: null,
      attachmentType: null,
      attachments: null,
      assigneeId: null,
    }),
    Comment: createMockModel("Comment", {}),
  };
} else {
  module.exports = { sequelize, User, Ticket, Comment };
}