using EduSapienxa.Domain.Entities;

namespace EduSapienxa.Infrastructure.Persistence;

public static class DataSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Categories.Any()) return; // ya hay datos

        // ── Categorías ──────────────────────────────────────────────────────────
        var catTech = new Category { Name = "Tecnología", Description = "Programación, IA y herramientas digitales" };
        var catNegocios = new Category { Name = "Negocios", Description = "Emprendimiento, marketing y finanzas" };
        var catDiseno = new Category { Name = "Diseño", Description = "UX/UI, diseño gráfico y multimedia" };
        db.Categories.AddRange(catTech, catNegocios, catDiseno);
        db.SaveChanges();

        // ── Subcategorías ────────────────────────────────────────────────────────
        var subWeb = new Subcategory { Name = "Desarrollo Web", CategoryId = catTech.Id };
        var subIA = new Subcategory { Name = "Inteligencia Artificial", CategoryId = catTech.Id };
        var subMarketing = new Subcategory { Name = "Marketing Digital", CategoryId = catNegocios.Id };
        var subEmprendimiento = new Subcategory { Name = "Emprendimiento", CategoryId = catNegocios.Id };
        var subUX = new Subcategory { Name = "UX/UI", CategoryId = catDiseno.Id };
        db.Subcategories.AddRange(subWeb, subIA, subMarketing, subEmprendimiento, subUX);
        db.SaveChanges();

        // ── Cursos ───────────────────────────────────────────────────────────────
        var cursos = new List<Course>
        {
            new() { Name = "Full Stack con .NET y Angular", Description = "Aprende a construir aplicaciones completas con .NET 8 y Angular 17.", Price = 299.00m, CheckoutUrl = "https://checkout.edusapienxa.com/fullstack-net-angular" },
            new() { Name = "Machine Learning con Python", Description = "Desde regresión lineal hasta redes neuronales con scikit-learn y TensorFlow.", Price = 349.00m, CheckoutUrl = "https://checkout.edusapienxa.com/ml-python" },
            new() { Name = "Marketing en Redes Sociales", Description = "Estrategias orgánicas y pagadas para Facebook, Instagram y TikTok.", Price = 199.00m, CheckoutUrl = "https://checkout.edusapienxa.com/marketing-redes" },
            new() { Name = "Emprendimiento Digital", Description = "Valida tu idea, construye un MVP y consigue tus primeros clientes.", Price = 249.00m, CheckoutUrl = "https://checkout.edusapienxa.com/emprendimiento-digital" },
            new() { Name = "Diseño UX: de cero a producto", Description = "Research, wireframes, prototipos en Figma y pruebas con usuarios.", Price = 279.00m, CheckoutUrl = "https://checkout.edusapienxa.com/ux-producto" },
        };
        db.Courses.AddRange(cursos);
        db.SaveChanges();

        // ── Relaciones curso ↔ subcategoría ──────────────────────────────────────
        db.CourseSubcategories.AddRange(
            new CourseSubcategory { CourseId = cursos[0].Id, SubcategoryId = subWeb.Id },
            new CourseSubcategory { CourseId = cursos[1].Id, SubcategoryId = subIA.Id },
            new CourseSubcategory { CourseId = cursos[2].Id, SubcategoryId = subMarketing.Id },
            new CourseSubcategory { CourseId = cursos[3].Id, SubcategoryId = subEmprendimiento.Id },
            new CourseSubcategory { CourseId = cursos[4].Id, SubcategoryId = subUX.Id }
        );
        db.SaveChanges();

        // ── Usuario editor ───────────────────────────────────────────────────────
        var editor = new AppUser
        {
            Name = "María García",
            Email = "editor@edusapienxa.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Editor@2026"),
            Role = "editor",
            IsActive = true
        };
        db.AppUsers.Add(editor);
        db.SaveChanges();

        // ── Leads ────────────────────────────────────────────────────────────────
        var leads = new List<Lead>
        {
            new() { Name = "Carlos Pérez",    Email = "carlos@gmail.com",  WhatsAppId = "51987654321", Status = "new",         Source = "whatsapp" },
            new() { Name = "Ana Torres",      Email = "ana@hotmail.com",   WhatsAppId = "51912345678", Status = "contacted",   Source = "whatsapp" },
            new() { Name = "Luis Mendoza",    Email = "luis@outlook.com",  WhatsAppId = null,          Status = "interested",  Source = "manual"   },
            new() { Name = "Sofia Ramos",     Email = "sofia@gmail.com",   WhatsAppId = "51956781234", Status = "converted",   Source = "whatsapp" },
            new() { Name = "Diego Castillo",  Email = "diego@gmail.com",   WhatsAppId = null,          Status = "lost",        Source = "manual"   },
        };
        db.Leads.AddRange(leads);
        db.SaveChanges();

        // ── Intereses de leads ───────────────────────────────────────────────────
        db.LeadInterests.AddRange(
            new LeadInterest { LeadId = leads[0].Id, CourseId = cursos[0].Id },
            new LeadInterest { LeadId = leads[0].Id, CategoryId = catTech.Id },
            new LeadInterest { LeadId = leads[1].Id, CourseId = cursos[2].Id },
            new LeadInterest { LeadId = leads[2].Id, SubcategoryId = subWeb.Id },
            new LeadInterest { LeadId = leads[3].Id, CourseId = cursos[4].Id },
            new LeadInterest { LeadId = leads[4].Id, CategoryId = catNegocios.Id }
        );
        db.SaveChanges();

        // ── Compras (Sofia ya compró) ────────────────────────────────────────────
        db.Purchases.Add(new Purchase
        {
            LeadId = leads[3].Id,
            CourseId = cursos[4].Id,
            AmountPaid = 279.00m,
            RegisteredById = editor.Id,
            PurchasedAt = DateTime.UtcNow.AddDays(-3),
            Notes = "Pago via transferencia bancaria"
        });
        db.SaveChanges();
    }
}
