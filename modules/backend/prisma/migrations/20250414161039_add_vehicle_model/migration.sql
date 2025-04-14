-- CreateTable
CREATE TABLE "Vehicle" (
   "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
   "name" TEXT NOT NULL,
   "make" TEXT NOT NULL,
   "model" TEXT NOT NULL,
   "year" INTEGER NOT NULL,
   "licensePlate" TEXT,
   "vin" TEXT,
   "color" TEXT,
   "type" TEXT NOT NULL,
   "status" TEXT NOT NULL DEFAULT 'active',
   "purchaseDate" DATETIME,
   "purchasePrice" REAL,
   "mileage" INTEGER,
   "fuelType" TEXT,
   "notes" TEXT,
   "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");
