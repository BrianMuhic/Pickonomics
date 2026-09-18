-- CreateTable
CREATE TABLE "PickReminder" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "sentOn" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PickReminder_leagueId_season_idx" ON "PickReminder"("leagueId", "season");

-- CreateIndex
CREATE UNIQUE INDEX "PickReminder_leagueId_userId_week_season_sentOn_key" ON "PickReminder"("leagueId", "userId", "week", "season", "sentOn");

-- AddForeignKey
ALTER TABLE "PickReminder" ADD CONSTRAINT "PickReminder_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickReminder" ADD CONSTRAINT "PickReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
