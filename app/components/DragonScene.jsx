"use client";

import { useEffect, useRef, useState } from "react";

// Mochi's rooms, left to right. Switching room slides the backdrop while she walks over.
export const dragonRooms = ["home", "bathroom", "beach"];

// Mounts the three.js dragon in front of her room. `command` is { id, nonce }; a new nonce plays
// that action. `room` is where she is: home, bathroom or beach.
export default function DragonScene({ command, onPet, room = "home" }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const onPetRef = useRef(onPet);
  const [failed, setFailed] = useState(false);
  const roomIndex = Math.max(0, dragonRooms.indexOf(room));
  const lastRoomRef = useRef(roomIndex);

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

  // A new room: Mochi walks that way while the backdrop slides along.
  useEffect(() => {
    const step = Math.sign(roomIndex - lastRoomRef.current);
    lastRoomRef.current = roomIndex;
    if (step) sceneRef.current?.walk(step);
  }, [roomIndex]);

  return (
    <div className="dragon-stage" ref={containerRef}>
      <div className="dragon-backdrop" aria-hidden="true" data-room={dragonRooms[roomIndex]}>
        <div className="dragon-backdrop-strip" style={{ transform: `translateX(${(-100 * roomIndex) / dragonRooms.length}%)` }}>
          {dragonRooms.map((name) => <img key={name} src={`/images/dragon/${name}.svg`} alt="" />)}
        </div>
      </div>
      {failed && (
        <p className="dragon-fallback">
          Mochi needs a browser with 3D graphics (WebGL) turned on to come out and play.
        </p>
      )}
    </div>
  );
}
