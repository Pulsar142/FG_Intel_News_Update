import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }

  const idsParam = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 20);

  if (ids.length === 0) {
    return Response.json({ questions: [] });
  }

  const rows = await db.expertQuestion.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      question: true,
      status: true,
      answer: true,
      answerFormat: true,
      sources: true,
      note: true,
      requestedAt: true,
    },
  });

  return Response.json({ questions: rows });
}
