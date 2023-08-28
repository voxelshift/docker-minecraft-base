# docker-minecraft
Docker images for various Minecraft server and proxy implementations.

## about
The goal of this project is to create a set of production-ready Docker images for Minecraft servers and networks. These
images are intentionally very bare-bones and unopinionated, aiming to change as little from the base server 
configuration as possible. Anti-features like auto-updating and plugin downloading are also not included, as this 
violates the Docker best practice of providing a reproducible environment.



## images
### paper


## data persistence
Minecraft servers often have a blurry line between what is configuration data and what is runtime storage data. For 
example, some would consider `ops.json` to be configuration data - it configures the operators for the server.
Others would consider this to be runtime data storage since it can be modified by the `/op` command. These images
don't take any stance on the persistence of runtime data - it is left up to the consumer of these images to decide
if these files should be persisted by creating a volume for them.

Note that this means that **no data is persisted by default**. When the container stops, you will lose your worlds,
plugin data, basically anything that the server writes in runtime. You **must** set up volumes if you need data 
persistence.

### recommendations
- Avoid using volumes unless absolutely necessary
    - You can always manage permissions and bans with a database-backed plugin instead
    - It may make sense to treat `ops.json` and `whitelist.json` as configuration files, but this can also be annoying
      if you plan on modifying these often
    - In most cases, you should be baking plugins and mods into your images
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
