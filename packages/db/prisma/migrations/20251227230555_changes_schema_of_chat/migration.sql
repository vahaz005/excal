-- CreateEnum
CREATE TYPE "Shape" AS ENUM ('rect', 'circle', 'pencil');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "Shape" "Shape" NOT NULL DEFAULT 'rect';
