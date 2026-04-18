import { useMemo, useState } from "react";
import { addComment, loadComments, voteComment } from "@/lib/community";

export default function VideoComments({ videoId }: { videoId: string }) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [comments, setComments] = useState(() => loadComments());

  const visible = useMemo(
    () => comments.filter((c) => c.videoId === videoId),
    [comments, videoId]
  );

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
      <h4 className="text-sm uppercase tracking-[0.25em] text-gold-200">Comments</h4>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          setComments(addComment(videoId, name, body));
          setBody("");
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-xl bg-black/50 px-3 py-2 text-sm text-platinum outline-none ring-1 ring-white/10 focus:ring-gold-300"
        />
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a comment..."
          className="rounded-xl bg-black/50 px-3 py-2 text-sm text-platinum outline-none ring-1 ring-white/10 focus:ring-gold-300"
        />
        <button type="submit" className="btn-gold !px-4 !py-2 text-xs">
          Comment
        </button>
      </form>
      <ul className="mt-4 space-y-2 max-h-56 overflow-auto pr-1">
        {visible.map((c) => (
          <li key={c.id} className="rounded-xl bg-black/45 px-3 py-2">
            <p className="text-xs text-platinum/65">{c.author || "Anonymous"}</p>
            <p className="text-sm text-platinum">{c.body}</p>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-platinum/70 hover:text-gold-200"
                onClick={() => setComments(voteComment(c.id, "up"))}
              >
                👍 {c.up}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-platinum/70 hover:text-gold-200"
                onClick={() => setComments(voteComment(c.id, "down"))}
              >
                👎 {c.down}
              </button>
            </div>
          </li>
        ))}
        {!visible.length && <li className="text-xs text-platinum/60">No comments yet — be the first.</li>}
      </ul>
    </div>
  );
}
