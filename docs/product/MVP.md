# MVP

## Product Sentence

This app turns ChatGPT-generated structured learning notes into an editable visual tree.

The first MVP is import, canvas tree, edit, URL share, and export.

## Primary Flow

1. Paste or load a ChatGPT-generated learning tree JSON.
2. Import the JSON into the internal `ConceptGraph`.
3. Render the graph as a Pixi.js tree canvas.
4. Select, edit, add, delete, and move nodes.
5. Encode the graph into a URL string for sharing.
6. Export the graph back to JSON.

## JSON Shape

The import/export format is nested JSON because it is easiest for ChatGPT and humans to read and write.

```json
{
  "title": "React Rendering",
  "body": "React renders components into UI.",
  "children": [
    {
      "title": "Reconciliation",
      "body": "React compares the previous and next tree.",
      "children": []
    }
  ]
}
```

The app stores and edits this as a normalized `ConceptGraph` internally.

## Format Choice

- Nested JSON is the public import/export format.
- Normalized `ConceptGraph` is the internal editing and URL state format.
- Edge-list JSON can come later if external graph tools need it.
- Markdown outline can come later as an additional importer.

## P0

- [x] ChatGPT JSON import schema
- [x] JSON to `ConceptGraph` adapter
- [x] `ConceptGraph` to JSON export adapter
- [x] URL string encode/decode
- [x] temporary React tree editor
- [x] paste-based JSON import/export UI
- [ ] split `GraphEditor.tsx` into stable editor components
- [ ] Pixi.js tree render
- [ ] Canvas node select/edit/add/delete/move

## P0 Follow-up

- JSON file drag-and-drop import is tracked separately in issue #4.
- `GraphEditor.tsx` split is tracked separately in issue #6 and should happen before adding more editor UI.
- Store adoption should wait until Pixi.js or another independent surface needs shared editor state.

## P1

- OpenAI fill-in for missing or thin nodes
- AWS save/load
- Notion export

## P2

- Figma export or deeper Figma-style editing
- Weak-node learning signals
- Study sessions and review scheduling
