{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs = {
    self,
    nixpkgs,
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};

    run-eleventy = pkgs.writeShellScriptBin "run-eleventy" ''
      exec npx @11ty/eleventy --serve --port 5500
    '';

    generate-css-colors = pkgs.writeShellScriptBin "generate-css-colors" ''
      matugen image $1 --config ./matugen/config.toml
    '';
  in {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [
        live-server
        prettier
        alejandra
        vscode-langservers-extracted

        pkgs.nodejs_22

        run-eleventy
        generate-css-colors
      ];
    };
  };
}
