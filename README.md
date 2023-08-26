# docker-minecraft
Docker images for various Minecraft server and proxy implementations.

## about
These Docker images are designed for building production-ready Minecraft servers and networks. They are very lightweight
and intentionally don't include [anti-features](https://en.wiktionary.org/wiki/anti-feature) like auto updating and 
plugin fetching.

While these features may be convenient they completely defeat the point of Dockerizing an application in the first place
(reproducible builds). Instead, the correct way to use these images is to extend them to create _your own_ Docker 
images that contain the necessary configuration for your server. This way your server's configuration is properly
versioned and reproducible.

### supported software
Currently there are Docker images for [Paper](https://papermc.io/software/paper) and 
[Velocity](https://papermc.io/software/velocity). There's plans to add support for Fabric servers in the near future.

Currently there are no plans to add support for Bukkit or Spigot since Paper is almost always the better option and
it's hard to justify the extra maintenance and development burden required to support them.

## data persistence
Minecraft servers often have a blurry line between what is configuration data and what is runtime storage data. For 
example, some would consider `ops.json` to be configuration data - it configures the operators for the server.
Others would consider this to be runtime data storage since it can be modified by the `/op` command. These images
don't take any stance on the persistence of runtime data - it is left up to the consumer of these images to decide
if these files should be persisted by creating a volume for them.

### recommendations
- Avoid using volumes unless absolutely necessary
    - You can always manage permissions and bans with a database-backed plugin instead
    - It may make sense to treat `ops.json` and `whitelist.json` as configuration files, but this can also be annoying
      if you plan on modifying these often
    - If you don't need world persistence, you can always keep the world files themselves as configuration data
- If you do need to use volumes, avoid using them to store strictly configuration files
    - Configuration-only files should be baked into the Docker image itself
    - Well designed plugins should split their config files from the data files - only create volumes for the data files
- **Make sure you back up your volumes**

## plugins/ mods
Most servers have at least a handful of plugins/ mods they'd like to add to their server. These images don't provide
method to download/ install plugins automatically. The user can either copy the plugins manually in their Dockerfile or
download them directly from APIs like [Spiget](https://spiget.org/), [Modrinth](https://docs.modrinth.com/api-spec/), 
[Hangar](https://hangar.papermc.io/api-docs), etc.
