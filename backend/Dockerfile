FROM denoland/deno:2.1.4

# create app directory
WORKDIR /app

# create data directory for SQLite database
RUN mkdir -p /app/data

# copy config and lock files
COPY import_map.json deno.json ./

# copy source code
COPY src/ src/

# expose the port your app runs on
EXPOSE 8000

# run the server
CMD ["deno", "run", "--import-map=import_map.json", "--allow-net", "--allow-read", "--allow-write", "--allow-ffi", "--allow-env", "src/mod.ts"]
