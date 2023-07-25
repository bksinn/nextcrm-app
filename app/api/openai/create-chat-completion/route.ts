// app/api/chat/route.ts

import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import openailib from "@/lib/openai";

export async function POST(req: Request) {
  const body = await req.json();
  const { prompt } = body;

  try {
    const gptModel = await prismadb.gpt_models.findMany({
      where: {
        status: "ACTIVE",
      },
    });

    console.log("Active GPT Model:", gptModel[0].model);

    const completion = await openailib.createChatCompletion({
      model: gptModel[0].model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.1,
    });
    console.log(completion.data.choices[0].message?.content, "completion");
    return NextResponse.json(
      { response: completion.data.choices[0].message?.content },
      { status: 200 }
    );
  } catch (error) {
    console.log("[OPENAI_CHAT_POST]", error);
    return new NextResponse("Initial error", { status: 500 });
  }
}