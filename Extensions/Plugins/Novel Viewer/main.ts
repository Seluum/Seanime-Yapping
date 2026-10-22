/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

function init() {
  $ui.register((ctx) => {
    ctx.dom.onReady(async () => {
      console.log(
        "[Novel Viewer] Extensão de integração de Light Novels iniciada.",
      );
    });

    const currentPath = ctx.state<string>("");

    ctx.screen.onNavigate(async (e) => {
      currentPath.set(e.pathname);

      if (e.pathname === "/entry" && e.searchParams?.id) {
        const mediaId = parseInt(e.searchParams.id);
        await handleNovelMetadata(ctx, mediaId);
      }
    });

    ctx.screen.loadCurrent();
  });
}

async function handleNovelMetadata(ctx: any, mediaId: number) {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: MANGA, format: NOVEL) {
        id
        title {
          romaji
          english
          native
        }
        format
        status
        description
        coverImage {
          extraLarge
          large
        }
        chapters
        volumes
        relations {
          edges {
            relationType
            node {
              id
              title {
                romaji
              }
              type
              format
            }
          }
        }
      }
    }
  `;

  try {
    const res = await ctx.fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: query,
        variables: { id: mediaId },
      }),
    });

    const json = await res.json();
    const media = json.data?.Media;

    if (media) {
      console.log(
        "[Novel Viewer] Light Novel detetada para injeção de UI:",
        media.title.romaji,
      );
    }
  } catch (err) {
    console.error("[Novel Viewer] Erro ao comunicar com o AniList:", err);
  }
}