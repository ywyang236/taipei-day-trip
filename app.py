from flask import *
from api.member import member_app
from api.attraction import attraction_app
from api.booking import booking_app
from api.order import order_app


app=Flask(__name__)
app.json.ensure_ascii = False
app.config["TEMPLATES_AUTO_RELOAD"]=True


# blueprints
app.register_blueprint(member_app)
app.register_blueprint(attraction_app)
app.register_blueprint(booking_app)
app.register_blueprint(order_app)


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
@app.route("/historical")
def historical():
	return render_template("historical.html")

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=3000, debug=True)