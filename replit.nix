{ pkgs }: {
  deps = [
    pkgs.libsmartcols
    pkgs.python310
    pkgs.libuuid
    pkgs.redis
  ];
  env = { LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.libuuid];  }; 
}