import { createPortal } from "react-dom";
import { memo, useState } from "react";
import {
  DragOverlay,
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import styles from "../styles/Home.module.css";
import produce from "immer";

// for each container, we have a set of props, including children
// children is a sorted array of objects (props)
type ChildDNDState = { id: string; dragging?: boolean };
type ContainerDNDState = { id: string; children: Array<ChildDNDState> };
type DNDSTate = ContainerDNDState[];

const Container = ({ c, id }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  const style = {
    width: "200px",
    height: "200px",
    border: "3px solid red",
    flexDirection: "column",
    background: isOver ? "green" : undefined,
  } as const;

  return (
    <div ref={setNodeRef} style={style}>
      {id}
      {c.children.map((c) => (
        <SmartBlock dragging={c.dragging} id={c.id} key={c.id}></SmartBlock>
      ))}
    </div>
  );
};

const Block = ({ id, rref, transform, listeners, attributes }) => {
  const style = {
    width: "40px",
    height: "40px",
    background: "orange",
    transform: CSS.Translate.toString(transform),
  };

  if (!transform) {
    delete style.transform;
  }

  return (
    <button ref={rref} style={style} {...listeners} {...attributes}>
      {id}
    </button>
  );
};

const SmartBlock = ({ dragging, id }) => {
  const { setNodeRef, transform, listeners, attributes } = useDraggable({
    id,
  });

  const overlay = typeof document !== "undefined";
  return (
    <>
      <Block
        id={id}
        rref={setNodeRef}
        transform={transform}
        listeners={listeners}
        attributes={attributes}
      />
    </>
  );
};

let cid = 1;
const initState = () => {
  return new Array(16).fill(0).map((_, i) => ({
    id: `parent-${i}`,
    children: new Array(4).fill(0).map((_) => ({ id: `child-${cid++}` })),
  }));
};

export default function Home() {
  const [state, setState] = useState<DNDSTate>(initState);

  return (
    <DndContext onDragEnd={handleDragEnd} >
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {state.map((c) => (
          <Container c={c} id={c.id} key={c.id}></Container>
        ))}
      </div>
    </DndContext>
  );

  function handleDragEnd(event: DragEndEvent) {
    if (event.over) {
      console.log("valid drop!");
      setState(
        produce((draft) => {
          const oldParent = draft.find((p) =>
            p.children.some((c) => c.id === event.active.id)
          );
          const newParent = draft.find((p) => p.id === event.over.id);
          // remove from the old one
          const child = oldParent.children.find(
            (c) => c.id === event.active.id
          );
          newParent.children.push({...child});
          child.id = `child-${cid++}`
          // remove the thingy from its previous parent id
          console.log(
            `old: ${oldParent.id}, new: ${newParent.id}, child: ${child.id}`
          );
        })
      );
    }
  }
}
