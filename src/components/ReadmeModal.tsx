import { motion } from "framer-motion";

interface Props {
  onClose: () => void;
}

export default function ReadmeModal({ onClose }: Props) {
  return (
    <motion.div
      data-native
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{
        background: "rgba(5, 4, 3, 0.88)",
        backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <motion.div
        data-native
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 0.9, 0.24, 1] }}
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          background: "#0d0b09",
          border: "1px solid rgba(226, 213, 193, 0.22)",
          borderRadius: 8,
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(226, 205, 168, 0.05)",
          overflow: "hidden",
          cursor: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(226, 213, 193, 0.12)",
          }}
        >
          <div className="f-mono" style={{ fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(226, 213, 192, 0.85)" }}>
            readme.md
          </div>
          <button
            data-native
            onClick={onClose}
            className="f-mono"
            style={{
              background: "none",
              border: "1px solid rgba(226, 213, 193, 0.2)",
              borderRadius: 999,
              color: "rgba(226, 213, 192, 0.7)",
              fontSize: 10,
              letterSpacing: "0.14em",
              padding: "4px 12px",
              cursor: "pointer",
              textTransform: "uppercase",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffdcab";
              e.currentTarget.style.borderColor = "rgba(255, 220, 171, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(226, 213, 192, 0.7)";
              e.currentTarget.style.borderColor = "rgba(226, 213, 193, 0.2)";
            }}
          >
            close ✕
          </button>
        </div>

        <div
          className="cat-scroll"
          style={{
            overflowY: "auto",
            padding: "28px 28px 40px",
            color: "rgba(226, 213, 192, 0.82)",
            fontSize: 13,
            lineHeight: 1.85,
          }}
        >
          <div className="f-serif italic" style={{ fontSize: 20, color: "rgba(244, 222, 186, 0.95)", marginBottom: 16 }}>
            welcome to the workshop
          </div>

          <p style={{ margin: "0 0 16px" }}>
            basically a cozy dark wooden workbench in your browser that silently watches how you move your mouse and rearranges itself around your vibe. it is kind of a toy, kind of a puzzle, and kind of a generative art catalogue.
          </p>

          <p style={{ margin: "0 0 28px" }}>
            here is the breakdown of what is going on, how to use everything, how modes switch, and how to find all the secrets.
          </p>

          <div className="f-mono" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255, 214, 160, 0.9)", margin: "24px 0 10px" }}>
            what is this thing
          </div>

          <p style={{ margin: "0 0 14px" }}>
            when you first load in, you are just staring at an empty dark wood table with faint shadows and dust floating around.
          </p>

          <p style={{ margin: "0 0 14px" }}>
            as you move your cursor through the dark, you will bump into handcrafted tools sleeping in the shadows. there are 6 tools in total:
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
            <li><strong style={{ color: "rgba(255, 214, 160, 0.95)" }}>the pen:</strong> draws thin ink scratches and scribbles onto the wood.</li>
            <li><strong style={{ color: "rgba(255, 214, 160, 0.95)" }}>the knife:</strong> carves sharp jagged cuts and slashes into the grain.</li>
            <li><strong style={{ color: "rgba(255, 214, 160, 0.95)" }}>the brush:</strong> spreads soft watercolor washes in muted natural tints.</li>
            <li><strong style={{ color: "rgba(255, 214, 160, 0.95)" }}>the ruler:</strong> measures distances across the bench and snaps alignment marks.</li>
            <li><strong style={{ color: "rgba(255, 214, 160, 0.95)" }}>the magnifier:</strong> lets you peek under the surface at secret engravings hidden in the wood.</li>
            <li><strong style={{ color: "rgba(255, 214, 160, 0.95)" }}>the clamp:</strong> anchors down a fixed brass point on the bench.</li>
          </ul>

          <p style={{ margin: "0 0 28px" }}>
            every tool has its own tactile sound when you grab it, scrape it across the wood, or leave marks.
          </p>

          <div className="f-mono" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255, 214, 160, 0.9)", margin: "24px 0 10px" }}>
            how to actually use the tools
          </div>

          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>finding tools:</strong> when you start, the bench is dark and empty. just move your mouse around slowly. when you get near a sleeping tool, you will see a faint ghostly shape. get closer and it pops into the light.
          </p>

          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>picking up a tool:</strong> click on any discovered tool to pick it up. your mouse cursor becomes the held tool.
          </p>

          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>making marks:</strong> while holding a tool, click and hold down in one spot on the wood. linger for about half a second and the tool will start biting into the wood, making a sound and leaving a mark. if you keep holding, it keeps leaving marks.
          </p>

          <p style={{ margin: "0 0 28px" }}>
            <strong style={{ color: "#fff" }}>putting a tool down:</strong> just tap click on an empty spot of wood, or hit Escape on your keyboard. the tool will glide down and rest wherever you dropped it.
          </p>

          <div className="f-mono" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255, 214, 160, 0.9)", margin: "24px 0 10px" }}>
            how modes work and how to change them
          </div>

          <p style={{ margin: "0 0 14px" }}>
            the bench is constantly tracking your movement pace, how far you jump between clicks, whether your paths are straight or wandering, and which tools you favor. after you use the bench for a bit (around 40 seconds to a minute with enough interactions), it automatically shifts into a mode that matches your behavior:
          </p>

          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>empty bench:</strong> the starting state. tools are scattered in the dark until you find them.
          </p>

          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>assembly line:</strong> if you move at a calm, methodical pace, move in straight lines, and switch between tools in an orderly way, the bench shifts into an assembly line. a long brass rail appears across the bench and your tools snap into neat workstations along the line.
          </p>

          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>scattered paths:</strong> if you are moving super fast, taking big erratic jumps across the screen, and switching tools rapidly, the bench enters scattered paths. glowing constellation threads light up between the tools you jump between most often.
          </p>

          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>drawers and compartments:</strong> if you pick one or two favorite tools and obsessively use them or hold them for a long time, the bench slides open compartments and drawers along the edges, tucking away the tools you ignore and keeping your favorites open front and center.
          </p>

          <p style={{ margin: "0 0 28px" }}>
            <strong style={{ color: "#fff" }}>remembered setup:</strong> the bench saves your state to your browser local storage, so whenever you come back later, everything is right where you left it.
          </p>

          <div className="f-mono" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255, 214, 160, 0.9)", margin: "24px 0 10px" }}>
            the index puzzle
          </div>

          <p style={{ margin: "0 0 14px" }}>
            once you find all 6 tools, an index bar shows up near the top of the bench with 6 empty sockets marked in Roman numerals (I through VI).
          </p>

          <p style={{ margin: "0 0 14px" }}>
            each socket belongs to a specific tool based on an ancient craftsman sequence:
            <br />I - write (the pen)
            <br />II - cut (the knife)
            <br />III - wash (the brush)
            <br />IV - measure (the ruler)
            <br />V - look (the magnifier)
            <br />VI - hold (the clamp)
          </p>

          <p style={{ margin: "0 0 14px" }}>
            to solve the puzzle, pick up each tool and set it into its matching socket from left to right:
            <br />1. put the pen in socket I
            <br />2. put the knife in socket II
            <br />3. put the brush in socket III
            <br />4. put the ruler in socket IV
            <br />5. put the magnifier in socket V
            <br />6. put the clamp in socket VI
          </p>

          <p style={{ margin: "0 0 28px" }}>
            when all 6 are in place, the bench chimes and marks the puzzle solved.
          </p>

          <div className="f-mono" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255, 214, 160, 0.9)", margin: "24px 0 10px" }}>
            the catalogue
          </div>

          <p style={{ margin: "0 0 14px" }}>
            once solved, a "the catalogue -&gt;" button appears in the bottom-right HUD controls.
          </p>

          <p style={{ margin: "0 0 14px" }}>
            clicking it opens up a full editorial monograph printed directly from your session data:
            <br />• it lists every single mark, cut, wash, and measurement you made with coordinates and timestamps.
            <br />• it logs your tool dwell times and pickup counts.
            <br />• clicking any specimen card in the catalogue re-sets the whole publication through that tool's design lens (ruler gives mm grids, brush gives color washes, magnifier adds marginalia, etc.).
            <br />• use the top navigation links to jump between sections (order, specimens, notes, pattern, ledger).
            <br />• click "&lt;- the bench" or "Return to the bench" to go back to your desk.
          </p>

          <div className="f-mono" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255, 214, 160, 0.9)", margin: "24px 0 10px" }}>
            how to find the /genesiz backlink
          </div>

          <p style={{ margin: "0 0 14px" }}>
            there is a secret hidden screen inside called /genesiz with the big serif G and mod message. you can find it in 3 different ways:
          </p>

          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>method 1: through the magnifying glass on the bench</strong>
            <br />1. pick up the magnifier tool on the bench.
            <br />2. hover it over the top-right area of the table (around 82% across, 18% down).
            <br />3. look through the glass lens to spot the faint subsurface text.
            <br />4. find where it says "/genesiz".
            <br />5. click directly on the "/genesiz" text through the glass to trigger the secret screen.
          </p>

          <p style={{ margin: "0 0 12px" }}>
            <strong style={{ color: "#fff" }}>method 2: inside the catalogue</strong>
            <br />1. open the catalogue using the bottom-right HUD button.
            <br />2. click the magnifier specimen card so the publication switches to the magnifier lens.
            <br />3. scroll down to section IV "seen through the glass".
            <br />4. click the "/genesiz" link marked with a dagger symbol (†).
          </p>

          <p style={{ margin: "0 0 16px" }}>
            <strong style={{ color: "#fff" }}>method 3: direct url navigation</strong>
            <br />just type or paste `/genesiz` at the end of the website URL in your browser address bar. the site will immediately route you to the secret screen.
          </p>

          <p style={{ margin: "0 0 28px" }}>
            click "return to bench" on the secret screen whenever you want to return with the URL clean.
          </p>

          <div className="f-mono" style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255, 214, 160, 0.9)", margin: "24px 0 10px" }}>
            shortcuts and controls
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            <li><strong style={{ color: "#fff" }}>sound toggle:</strong> click "sound · on/off" in the bottom-right or press 'M' on your keyboard.</li>
            <li><strong style={{ color: "#fff" }}>escape key:</strong> drops whatever tool you are holding, or closes open screens.</li>
            <li><strong style={{ color: "#fff" }}>wipe the bench:</strong> click "wipe the bench" in the bottom-right HUD to reset all marks and start completely fresh from the dark.</li>
            <li><strong style={{ color: "#fff" }}>readme.md:</strong> click "readme.md" in the bottom-right HUD anytime to pull up this guide.</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
