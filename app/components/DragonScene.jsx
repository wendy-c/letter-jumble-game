"use client";

import { useEffect, useRef, useState } from "react";

// Mounts the three.js dragon (`dragon` is "mochi" or "tofu") in front of her rooms. `rooms` lists
// her rooms left to right and `room` is where she is; switching room slides the backdrop while she
// walks over. `command` is { id, nonce }; a new nonce plays that action.
export default function DragonScene({ dragon = "mochi", name = "Mochi", rooms, room, command, onPet }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const onPetRef = useRef(onPet);
  const [failed, setFailed] = useState(false);
  const roomIndex = Math.max(0, rooms.indexOf(room));
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
        dragonScene = createDragonScene(containerRef.current, { dragon, onPet: () => onPetRef.current?.() });
        sceneRef.current = dragonScene;
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      dragonScene?.dispose();
      sceneRef.current = null;
    };
  }, [dragon]);

  useEffect(() => {
    if (command) sceneRef.current?.play(command.id);
  }, [command]);

  // A new room: the dragon walks that way while the backdrop slides along.
  useEffect(() => {
    const step = Math.sign(roomIndex - lastRoomRef.current);
    lastRoomRef.current = roomIndex;
    if (step) sceneRef.current?.walk(step);
  }, [roomIndex]);

  return (
    <div className="dragon-stage" ref={containerRef}>
      <div className="dragon-backdrop" aria-hidden="true" data-room={rooms[roomIndex]}>
        <div className="dragon-backdrop-strip" style={{ transform: `translateX(${(-100 * roomIndex) / rooms.length}%)` }}>
          {rooms.map((roomName) => <img key={roomName} src={`/images/dragon/${roomName}.svg`} alt="" />)}
        </div>
      </div>
      {failed && (
        <p className="dragon-fallback">
          {name} needs a browser with 3D graphics (WebGL) turned on to come out and play.
        </p>
      )}
    </div>
  );
}
