/*
  Warnings:

  - Made the column `mensagem` on table `intencao` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "intencao" ALTER COLUMN "telefone" DROP NOT NULL,
ALTER COLUMN "mensagem" SET NOT NULL;
