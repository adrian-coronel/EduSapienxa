using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduSapienxa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLastInteractionToLead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastInteraction",
                table: "Leads",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastInteraction",
                table: "Leads");
        }
    }
}
