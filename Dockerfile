# 1. koristimo node js image (verzija 20)
FROM node:20

# 2. pravimo radni direktorijum app unutar kontejnera za nas kod
WORKDIR /app

# 3. Kopiramo package.json i package-lock.json
COPY package*.json ./

# 4. Instaliramo zavisnosti
RUN npm install

# 5. Kopiramo ostatak koda aplikacije
COPY . .

# 6. generisemo prisma klijent
RUN npx prisma generate

# 7. Pravimo produkcioni build aplikacije
RUN npm run build

# 8. Otvaramo port 3000
EXPOSE 3000

# 9. Komande kojima pokrecemo aplikaciju
CMD ["npm", "run", "start"]