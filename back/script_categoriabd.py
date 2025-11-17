######################################################
######################################################
# ESTE SCRIPT SE EJECUTA SOLO UNA VEZ DESDE CONSOLA
# SI SE EJECUTA MAS DE UNA VEZ SE ROMPE
# INSTRUCCIONES EN README
######################################################
######################################################



from app import app, db
from models.models import Categoria

categorias = [
    "Anuncios y Noticias",
    "Clases y Builds",
    "Gremios y Reclutamientos",
    "Reportes y Bugs",
    "Crafteo y economía",
    "PvP",
    "PvE y misiones",
    "General",
    "Otros y Off Topic"
]

def agregarCategorias_db():
    with app.app_context():    #NECESARIO PARA QUE FUNCIONE DENTRO DE FLASK
        for nombre_categoria in categorias:
            nueva_categoria = Categoria(name=nombre_categoria)
            db.session.add(nueva_categoria)
            print(f"Se agregó la categoria: {nombre_categoria}")
        
        db.session.commit()
        print ("Todas la categorias agregadas con exito")

if __name__ == "__main__":
    agregarCategorias_db()

