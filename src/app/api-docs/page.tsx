"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// Ucitivamo swagger na klijentskoj strani i naglasavamo preko ssr da se ne renderuje na serveru
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

// Ovo je API specifikacija (JSON format)
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "SmartBudget API",
    version: "1.0.0",
    description: "API dokumentacija za SmartBudget aplikaciju.",
  },
  paths: {
    "/api/login": {
      post: {
        summary: "Prijava korisnika",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Uspešna prijava" },
          "401": { description: "Pogrešni podaci" },
        },
      },
    },
    "/api/transactions": {
      get: {
        summary: "Dohvati sve transakcije korisnika",
        parameters: [
          {
            name: "userId",
            // query znaci da zahtev koji saljemo tj userId se u URL nalazi odmah iza znaka ?
            in: "query",
            // znaci da je ovaj parametar obavezan
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Niz transakcija" },
        },
      },
      post: {
        summary: "Dodaj novu transakciju",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                // JSON mora biti objekat
                type: "object",
                properties: {
                  amount: { type: "number" },
                  type: { type: "string", example: "EXPENSE" },
                  date: { type: "string", format: "date-time" },
                  walletId: { type: "integer" },
                  categoryId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Transakcija kreirana" },
        },
      },
    },
    "/api/wallets": {
      get: {
        summary: "Dohvati novčanike korisnika",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Niz novčanika" },
        },
      },
    },
  },
};

export default function ApiDocsPage() {
  return (
    <div className="bg-white min-h-screen pb-10">
      <div className="bg-gray-900 text-white p-6 mb-8 text-center">
        <h1 className="text-3xl font-bold">SmartBudget - API Dokumentacija</h1>
        <p className="text-gray-400 mt-2">Zvanična Swagger specifikacija</p>
      </div>
      <div className="max-w-5xl mx-auto">
        <SwaggerUI spec={swaggerSpec} />
      </div>
    </div>
  );
}