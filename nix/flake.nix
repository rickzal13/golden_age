{
  description = "Golden Age App — dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            docker
            minio-client
            postgresql_16
          ];

          shellHook = ''
            echo "Golden Age dev environment"
            echo "  bun:         $(bun --version)"
            echo "  node:        $(node --version)"
            echo "  docker:      $(docker --version)"
            echo "  postgres:    $(psql --version)"
            echo ""
            echo "Run 'docker compose -f docker/docker-compose.yml up -d' to start services"
            echo ""
            echo "Then: bun install && bun run dev"
          '';
        };
      }
    );
}
