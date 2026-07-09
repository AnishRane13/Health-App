/**
 * Insert rows in batches to avoid huge single round-trips over Render → Neon.
 */
async function insertManyBatched(prisma, model, rows, batchSize = 1000) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const result = await prisma[model].createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;
  }
  return inserted;
}

module.exports = { insertManyBatched };
