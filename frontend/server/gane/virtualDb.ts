/**
 * G.A.N.E — Virtual Database Adapter
 * ==================================
 * In-memory Drizzle-like fallback for local development and tests when
 * DATABASE_URL is not configured. Supports the subset of chained select /
 * insert / update / delete behavior exercised by the frontend test suite.
 */

export function createVirtualDb(): any {
  console.log("[VirtualDB] Initializing in-memory fallback store");

  const store: Record<string, any[]> = {
    users: [],
    fleets: [],
    vehicles: [],
    missions: [],
    collaboration_sessions: [],
    collaboration_participants: [],
    shared_markers: [],
    shared_annotations: [],
    trips: [],
    alerts: [],
    trip_events: [],
    log_entries: [],
    collaboration_events: [],
    collaboration_invites: [],
    generic: [],
  };

  const seed = () => {
    store.users.push({
      id: 1,
      openId: "gane_admin",
      name: "G.A.N.E Administrator",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (let i = 1; i <= 5; i++) {
      store.fleets.push({
        id: i,
        name: `Fleet-${i}`,
        ownerId: 1,
        maxVehicles: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    for (let i = 1; i <= 12; i++) {
      const fleetId = ((i - 1) % 3) + 1;
      store.vehicles.push({
        id: i,
        fleetId,
        deviceId: `DEV-GANE-${i.toString().padStart(3, "0")}`,
        name: `Unit-${i}`,
        type: i % 2 === 0 ? "truck" : "car",
        status: "active",
        lastLat: 32.0853 + (Math.random() - 0.5) * 0.1,
        lastLon: 34.7818 + (Math.random() - 0.5) * 0.1,
        lastHeading: Math.random() * 360,
        lastSpeed: 40 + Math.random() * 40,
        lastSeen: new Date(),
        batteryLevel: 80 + Math.random() * 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  };

  const startSimulation = () => {
    const timer = setInterval(() => {
      store.vehicles.forEach((vehicle) => {
        if (vehicle.status !== "active") return;

        const headingRad = vehicle.lastHeading * Math.PI / 180;
        const distDeg = ((vehicle.lastSpeed || 50) / 3600 / 111) * 2;

        vehicle.lastLat += Math.cos(headingRad) * distDeg + (Math.random() - 0.5) * 0.0001;
        vehicle.lastLon += Math.sin(headingRad) * distDeg + (Math.random() - 0.5) * 0.0001;
        vehicle.lastHeading += (Math.random() - 0.5) * 10;
        vehicle.lastSeen = new Date();

        const chance = Math.random();
        if (chance < 0.05) {
          vehicle.signalCondition = "spoofed";
          vehicle.lastLat += (Math.random() - 0.5) * 0.5;
        } else if (chance < 0.1) {
          vehicle.signalCondition = "jammed";
          vehicle.batteryLevel = Math.max(0, vehicle.batteryLevel - 0.5);
        } else {
          vehicle.signalCondition = "nominal";
        }
      });
    }, 2000);

    timer.unref?.();
  };

  seed();
  startSimulation();

  const TABLE_NAME_SYMBOL = "Symbol(drizzle:Name)";
  const BASE_NAME_SYMBOL = "Symbol(drizzle:BaseName)";
  const COLUMNS_SYMBOL = "Symbol(drizzle:Columns)";

  const getSymbolValue = (target: any, symbolName: string) => {
    const symbol = Object.getOwnPropertySymbols(target ?? {}).find(
      (item) => String(item) === symbolName
    );
    return symbol ? target[symbol] : undefined;
  };

  const resolveTableName = (target: any) =>
    getSymbolValue(target, TABLE_NAME_SYMBOL) ??
    getSymbolValue(target, BASE_NAME_SYMBOL) ??
    target?.getTableName?.() ??
    (typeof target === "string" ? target : "generic");

  const resolveTableColumns = (target: any) =>
    getSymbolValue(target, COLUMNS_SYMBOL) ?? {};

  const getTableStore = (tableName: string) => {
    if (!store[tableName]) {
      store[tableName] = [];
    }
    return store[tableName];
  };

  const isSql = (value: any) => value?.constructor?.name === "SQL";
  const isColumn = (value: any) => typeof value?.name === "string" && value?.table;
  const isParam = (value: any) => value?.constructor?.name === "Param";
  const isStringChunk = (value: any) => value?.constructor?.name === "StringChunk";

  const chunkText = (value: any) => isStringChunk(value) ? value.value.join("") : "";

  const normalizeValue = (value: any) =>
    value instanceof Date ? value.getTime() : value;

  const isCountExpression = (value: any) =>
    isSql(value) &&
    value.queryChunks.length === 1 &&
    chunkText(value.queryChunks[0]).toUpperCase().includes("COUNT(*)");

  const evaluateCondition = (row: any, condition: any): boolean => {
    if (!condition || !isSql(condition)) return true;

    const meaningful = condition.queryChunks.filter((chunk: any) => {
      if (!isStringChunk(chunk)) return true;
      return chunkText(chunk) !== "";
    });

    if (
      meaningful.length === 3 &&
      chunkText(meaningful[0]) === "(" &&
      isSql(meaningful[1]) &&
      chunkText(meaningful[2]) === ")"
    ) {
      return evaluateCondition(row, meaningful[1]);
    }

    const andParts: any[][] = [];
    let current: any[] = [];

    meaningful.forEach((chunk: any) => {
      if (isStringChunk(chunk) && chunkText(chunk).trim() === "and") {
        if (current.length > 0) andParts.push(current);
        current = [];
        return;
      }
      current.push(chunk);
    });

    if (current.length > 0) {
      andParts.push(current);
    }

    if (andParts.length > 1) {
      return andParts.every((part) =>
        evaluateCondition(row, { constructor: { name: "SQL" }, queryChunks: part })
      );
    }

    if (
      meaningful.length === 3 &&
      isColumn(meaningful[0]) &&
      isStringChunk(meaningful[1]) &&
      (isParam(meaningful[2]) || isColumn(meaningful[2]))
    ) {
      const operator = chunkText(meaningful[1]).trim();
      const left = normalizeValue(row[meaningful[0].name]);
      const rightSource = meaningful[2];
      const right = normalizeValue(
        isParam(rightSource) ? rightSource.value : row[rightSource.name]
      );

      switch (operator) {
        case "=":
          return left === right;
        case "<":
          return left < right;
        case "<=":
          return left <= right;
        case ">":
          return left > right;
        case ">=":
          return left >= right;
        default:
          return true;
      }
    }

    if (meaningful.length === 1 && isSql(meaningful[0])) {
      return evaluateCondition(row, meaningful[0]);
    }

    return true;
  };

  const resolveOrderSpec = (clause: any) => {
    if (isColumn(clause)) {
      return { column: clause.name, direction: "asc" as const };
    }
    if (isSql(clause)) {
      const column = clause.queryChunks.find((chunk: any) => isColumn(chunk));
      if (!column) return null;
      const direction = clause.queryChunks.some(
        (chunk: any) => isStringChunk(chunk) && chunkText(chunk).includes("desc")
      )
        ? "desc"
        : "asc";
      return { column: column.name, direction };
    }
    return null;
  };

  const projectRows = (rows: any[], selectFields: Record<string, any> | undefined) => {
    if (!selectFields) return rows;

    const entries = Object.entries(selectFields);
    if (entries.length === 1 && isCountExpression(entries[0][1])) {
      return [{ [entries[0][0]]: rows.length }];
    }

    return rows.map((row) =>
      Object.fromEntries(
        entries.map(([alias, field]) => [
          alias,
          isColumn(field) ? row[field.name] : row[alias],
        ])
      )
    );
  };

  const applyDefaults = (
    row: Record<string, any>,
    columns: Record<string, any>,
    dataSet: any[]
  ) => {
    Object.entries(columns).forEach(([key, column]: [string, any]) => {
      if (row[key] !== undefined) return;

      if (column.autoIncrement || column.primary) {
        row[key] = dataSet.length + 1;
        return;
      }

      if (typeof column.defaultFn === "function") {
        row[key] = column.defaultFn();
        return;
      }

      if (column.default !== undefined) {
        row[key] = isSql(column.default) || column.dataType === "date"
          ? new Date()
          : column.default;
        return;
      }

      if (column.dataType === "date") {
        row[key] = new Date();
      }
    });
  };

  const findConflictingRow = (
    dataSet: any[],
    row: Record<string, any>,
    columns: Record<string, any>
  ) => {
    for (const [key, column] of Object.entries(columns)) {
      const col = column as any;
      if (!(col.primary || col.isUnique)) continue;
      if (row[key] === undefined) continue;

      const existing = dataSet.find((item) => item[key] === row[key]);
      if (existing) {
        return existing;
      }
    }
    return undefined;
  };

  const createQueryBuilder = (tableName: string) => {
    const builder: any = {
      _table: tableName,
      _tableRef: undefined,
      _columns: {},
      _mode: "select",
      _limit: undefined,
      _data: undefined,
      _where: undefined,
      _orderBy: [],
      _selectFields: undefined,
      _set: undefined,
      _duplicateUpdate: undefined,
      select: (fields?: Record<string, any>) => {
        builder._mode = "select";
        builder._selectFields = fields;
        return builder;
      },
      insert: (target: any) => {
        builder._mode = "insert";
        builder._table = resolveTableName(target);
        builder._tableRef = target;
        builder._columns = resolveTableColumns(target);
        return builder;
      },
      update: (target: any) => {
        builder._mode = "update";
        builder._table = resolveTableName(target);
        builder._tableRef = target;
        builder._columns = resolveTableColumns(target);
        return builder;
      },
      delete: (target: any) => {
        builder._mode = "delete";
        builder._table = resolveTableName(target);
        builder._tableRef = target;
        builder._columns = resolveTableColumns(target);
        return builder;
      },
      from: (target: any) => {
        builder._table = resolveTableName(target);
        builder._tableRef = target;
        builder._columns = resolveTableColumns(target);
        return builder;
      },
      where: (condition: any) => {
        builder._where = condition;
        return builder;
      },
      orderBy: (...clauses: any[]) => {
        builder._orderBy = clauses;
        return builder;
      },
      limit: (n: number) => {
        builder._limit = n;
        return builder;
      },
      values: (data: any) => {
        builder._data = data;
        return builder;
      },
      set: (data: any) => {
        builder._set = data;
        return builder;
      },
      onDuplicateKeyUpdate: (config: { set?: Record<string, any> }) => {
        builder._duplicateUpdate = config?.set ?? {};
        return builder;
      },
      async execute() {
        const table = builder._table || "generic";
        const tableData = getTableStore(table);

        if (builder._mode === "insert" && builder._data !== undefined) {
          const items = Array.isArray(builder._data) ? builder._data : [builder._data];
          let lastId = 0;
          items.forEach((item: any) => {
            const entry = { ...item };
            applyDefaults(entry, builder._columns, tableData);
            entry.updatedAt ??= new Date();
            entry.createdAt ??= entry.updatedAt;

            const conflict = findConflictingRow(tableData, entry, builder._columns);
            if (conflict && builder._duplicateUpdate) {
              Object.assign(conflict, builder._duplicateUpdate, { updatedAt: new Date() });
              lastId = conflict.id ?? lastId;
              return;
            }

            tableData.push(entry);
            lastId = entry.id ?? tableData.length;
          });
          const result = [{ insertId: lastId }];
          (result as any).insertId = lastId;
          return result;
        }

        if (builder._mode === "update") {
          const matches = tableData.filter((row) => evaluateCondition(row, builder._where));
          matches.forEach((row) => {
            Object.assign(row, builder._set ?? {}, { updatedAt: new Date() });
          });
          return { rowsAffected: matches.length };
        }

        if (builder._mode === "delete") {
          const remaining = tableData.filter((row) => !evaluateCondition(row, builder._where));
          const removed = tableData.length - remaining.length;
          store[table] = remaining;
          return { rowsAffected: removed };
        }

        let result = tableData.filter((row) => evaluateCondition(row, builder._where));

        const orderSpecs = builder._orderBy
          .map(resolveOrderSpec)
          .filter(Boolean) as { column: string; direction: "asc" | "desc" }[];

        if (orderSpecs.length > 0) {
          result = [...result].sort((left, right) => {
            for (const spec of orderSpecs) {
              const a = normalizeValue(left[spec.column]);
              const b = normalizeValue(right[spec.column]);
              if (a === b) continue;
              const comparison = a < b ? -1 : 1;
              return spec.direction === "desc" ? -comparison : comparison;
            }
            return 0;
          });
        }

        if (builder._limit !== undefined) {
          result = result.slice(0, builder._limit);
        }

        return projectRows(result, builder._selectFields);
      },
      then(resolve: any, reject: any) { return builder.execute().then(resolve, reject); },
      catch(reject: any) { return builder.execute().catch(reject); },
      finally(handler: any) { return builder.execute().finally(handler); },
    };

    return builder;
  };

  let proxy: any;
  const dbInstance = {
    execute: async () => createQueryBuilder("generic").execute(),
    select: (fields?: Record<string, any>) => createQueryBuilder("generic").select(fields),
    insert: (target: any) => createQueryBuilder(resolveTableName(target)).insert(target),
    update: (target: any) => createQueryBuilder(resolveTableName(target)).update(target),
    delete: (target: any) => createQueryBuilder(resolveTableName(target)).delete(target),
    query: {
      findMany: async (args: any) => {
        const target = (args as any)?._with?.tableName || "generic";
        return store[target] || [];
      },
      findFirst: async (args: any) => {
        const target = (args as any)?._with?.tableName || "generic";
        return store[target]?.[0] || null;
      },
    },
    transaction: async (cb: any) => cb(proxy),
  };

  proxy = new Proxy(dbInstance, {
    get: (target: any, prop: string) => {
      if (prop in target) return target[prop];
      return createQueryBuilder(prop);
    },
  });

  return proxy;
}
