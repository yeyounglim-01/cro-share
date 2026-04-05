import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  const userApiKey = req.headers.get('x-user-api-key');
  if (!userApiKey) {
    return Response.json({ error: 'API key가 필요합니다.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: '잘못된 요청' }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: userApiKey });

  try {
    if (body.task === 'optimize_palette') {
      const palette = body.currentPalette as string[];
      const colorCount = body.colorCount as number;

      const content: Anthropic.MessageParam['content'] = [];

      if (body.imageUrl && typeof body.imageUrl === 'string' && body.imageUrl.startsWith('data:image')) {
        const base64 = body.imageUrl.split(',')[1];
        const mediaType = body.imageUrl.split(';')[0].split(':')[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        });
      }

      content.push({
        type: 'text',
        text: `이 이미지를 뜨개질 도안으로 만들 때 최적의 ${colorCount}가지 색상 팔레트를 제안해주세요.
현재 자동 추출된 팔레트: ${palette.join(', ')}

뜨개질 실 색상으로 적합하고, 이미지를 잘 표현하는 색상들을 추천해주세요.
반드시 아래 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{"colors": [{"hex": "#RRGGBB", "name": "색상명(한국어)"}, ...]}`,
      });

      const msg = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 512,
        messages: [{ role: 'user', content }],
      });

      const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON 파싱 실패');
      const parsed = JSON.parse(jsonMatch[0]);
      return Response.json(parsed);
    }

    if (body.task === 'analyze_difficulty') {
      const { gridWidth, gridHeight, colorCount, cells } = body as {
        gridWidth: number; gridHeight: number; colorCount: number; cells: number[][];
      };

      // Calculate color transition stats
      let transitions = 0;
      for (const row of cells) {
        for (let i = 1; i < row.length; i++) {
          if (row[i] !== row[i - 1]) transitions++;
        }
      }
      const avgTransitions = Math.round(transitions / gridHeight);

      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `뜨개질 도안 분석을 해주세요:
- 격자 크기: ${gridWidth}×${gridHeight} 코
- 색상 수: ${colorCount}가지
- 행당 평균 색상 전환: ${avgTransitions}회

난이도, 권장 기법(인타샤/페어아일), 주의사항을 간결하게 한국어로 알려주세요. 3-4문장으로만.`,
        }],
      });

      const analysis = msg.content[0].type === 'text' ? msg.content[0].text : '';
      return Response.json({ analysis });
    }

    return Response.json({ error: '알 수 없는 task' }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '서버 오류';
    return Response.json({ error: msg }, { status: 500 });
  }
}
