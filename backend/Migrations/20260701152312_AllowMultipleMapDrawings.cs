using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AllowMultipleMapDrawings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MapDrawings_PersonId",
                table: "MapDrawings");

            migrationBuilder.CreateIndex(
                name: "IX_MapDrawings_PersonId",
                table: "MapDrawings",
                column: "PersonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MapDrawings_PersonId",
                table: "MapDrawings");

            migrationBuilder.CreateIndex(
                name: "IX_MapDrawings_PersonId",
                table: "MapDrawings",
                column: "PersonId",
                unique: true);
        }
    }
}
