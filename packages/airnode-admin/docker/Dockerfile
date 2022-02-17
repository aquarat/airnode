FROM node:14.17-alpine3.14

ENV name="airnode-admin"
ENV appDir="/app"

LABEL application=${name} \
      description="Airnode Admin CLI"

WORKDIR ${appDir}

COPY --from=aquarat/airnode-artifacts /dependencies/common ${appDir}/node_modules
COPY --from=aquarat/airnode-artifacts /dependencies/airnode-admin ${appDir}/node_modules
COPY --from=aquarat/airnode-artifacts /packages ${appDir}/node_modules/@api3/
COPY --from=aquarat/airnode-artifacts /build/packages/airnode-admin/dist ${appDir}/

# Make the binary available within PATH
RUN ln -s ${appDir}/bin/admin.js "/usr/local/bin/airnode-admin" && chmod +x "/usr/local/bin/airnode-admin"
# Create Airnode user
RUN adduser -h ${appDir} -s /bin/false -S -D -H ${name}
USER ${name}

ENTRYPOINT ["node", "/usr/local/bin/airnode-admin"]
