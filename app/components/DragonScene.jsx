"use client";

import { useEffect, useRef, useState } from "react";

// Mounts the three.js dragon. `command` is { id, nonce }; a new nonce plays that action.
export default function DragonScene({ command, onPet }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const onPetRef = useRef(onPet);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onPetRef.current = onPet;
  }, [onPet]);

  useEffect(() => {
    let disposed = false;
    let dragonScene = null;

    // three.js is loaded only in the browser, and only when the dragon is opened.
    import("../lib/dragon/scene")
      .then(({ createDragonScene }) => {
        if (disposed) return;
        dragonScene = createDragonScene(containerRef.current, { onPet: () => onPetRef.current?.() });
        sceneRef.current = dragonScene;
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      dragonScene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (command) sceneRef.current?.play(command.id);
  }, [command]);

  return (
    <div className="dragon-stage" ref={containerRef}>
      {failed && (
        <p className="dragon-fallback">
          Mochi needs a browser with 3D graphics (WebGL) turned on to come out and play.
        </p>
      )}
    </div>
  );
}
