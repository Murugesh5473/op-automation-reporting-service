# syntax=docker/dockerfile:1.4

############################
# Build stage
############################
FROM us-central1-docker.pkg.dev/<GCP_PROJECT>/<REGISTRY_NAME>/node_golden_image:node-22-secure AS build

WORKDIR /usr/src/app

# Copy npm config for private registry
COPY .npmrc .npmrc

# # Authenticate with Google Artifact Registry
RUN npx -y google-artifactregistry-auth \
    --repo-config=.npmrc \
    --credential-config=.npmrc || cat /root/.npm/_logs/*.log


# Copy dependency manifests
COPY package.json package-lock.json ./

RUN npm install --package-lock-only

# Install dependencies deterministically
RUN npm ci --engine-strict=false

# Copy application source
COPY . .

# Remove dev dependencies
RUN npm prune --omit=dev

# Remove sensitive and unnecessary files
RUN rm -rf \
    .npmrc \
    /root/.npm/_logs \
    *.log \
    coverage

############################
# Runtime stage (PROD)
############################
FROM us-central1-docker.pkg.dev/<GCP_PROJECT>/<REGISTRY_NAME>/node_golden_image:node-22-secure

WORKDIR /usr/src/app

# CRITICAL: remove global npm packages (main CVE source)
RUN npm cache clean --force \
    && rm -rf \
        /usr/local/lib/node_modules \
        /usr/lib/node_modules/npm \
        /usr/bin/npm \
        /usr/bin/npx \
        /root/.npm \
        /root/.node-gyp \
        /tmp/npm* \
        /tmp/corepack* 2>/dev/null || true

# Copy only production artifacts
COPY --from=build /usr/src/app ./

EXPOSE 3000

CMD ["node", "server.js"]