-- CreateTable
CREATE TABLE "WeeklyResult" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "totalPicks" INTEGER NOT NULL,
    "wonWeek" BOOLEAN NOT NULL DEFAULT false,
    "finalizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyResult_leagueId_season_idx" ON "WeeklyResult"("leagueId", "season");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyResult_leagueId_userId_week_season_key" ON "WeeklyResult"("leagueId", "userId", "week", "season");

-- AddForeignKey
ALTER TABLE "WeeklyResult" ADD CONSTRAINT "WeeklyResult_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyResult" ADD CONSTRAINT "WeeklyResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
