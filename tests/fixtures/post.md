### How to use it?

Once installed brew and started the launchd service:

```shell
brew install koekeishiya/formulae/skhd
brew services start skhd
```

{{< figure src="/images/posts/3-docker/docker-mac-diagram.excalidraw-black.webp" caption="Docker bind mount diagram" >}}

You need to create a configuration file in one of the [following locations](https://www.example.com) (in order of preference):

```shell
- $XDG_CONFIG_HOME/skhd/skhdrc
- $HOME/.config/skhd/skhdrc
- $HOME/.skhdrc
```
