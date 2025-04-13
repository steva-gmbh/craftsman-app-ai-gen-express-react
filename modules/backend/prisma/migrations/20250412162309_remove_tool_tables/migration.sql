/*
  Warnings:

  - You are about to drop the `JobTool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tool` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "JobTool";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Tool";
PRAGMA foreign_keys=on;
