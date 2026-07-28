# README

This tool generates TypeScript types from a Grist document.

It inspects the document schema (tables and columns) and generates TypeScript interfaces matching the values returned by the Grist Plugin API (`grist.docApi.fetchTable()`) which is cellFormat=normal representation by default.

The generator reads the document schema using the Grist REST API, then produces types designed to be used with the Grist Plugin API.
