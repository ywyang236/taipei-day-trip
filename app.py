from flask import *
app=Flask(__name__)
app.json.ensure_ascii = False
app.config["TEMPLATES_AUTO_RELOAD"]=True


# blueprints
from api.attraction import attraction_app
from api.member import member_app

app.register_blueprint(attraction_app)
app.register_blueprint(member_app)

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=3000)