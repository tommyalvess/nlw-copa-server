/*
  Warnings:

  - A unique constraint covering the columns `[participantId]` on the table `Ranking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ranking_participantId_key" ON "Ranking"("participantId");
