const express = require("express");
const routes = express.Router();

/* Verificar se o metodo GET pegar um "/", será executado uma
 * função. Essa função recebe dois argumentos (request e response).
 */

/*
const basePath = __dirname + "/views";

routes.get("/", (req, res) => res.sendFile(basePath + "/index.html"));
routes.get("/job", (req, res) => res.sendFile(basePath + "/job.html"));
routes.get("/job/edit", (req, res) => res.sendFile(basePath + "/job-edit.html"));
routes.get("/profile", (req, res) => res.sendFile(basePath + "/profile.html"));
*/

////////////////////////////////////////////////////////////////////////////////////////////////

/* Enviando o arquivo com base no EJS, onde ele será renderizado
 * pelo motor do EJS.
 * Por padrão o EJS já reconhece por padrão a pasta views e atribui ao
 * caminho base, não necessitando criar o basePath.
 */

/* O EJS por padrão ele lê a pasta views no diretório raiz, como ele
 * está dentro de src, então e necessário criar esse caminho.
 */
const views = __dirname + "/views/";

//Objeto Profile
const Profile = {
  data:{
    name: "Patrick",
    avatar: "https://github.com/POliveira29.png",
    "monthly-budget": 3000,
    "days-per-week": 5,
    "hours-per-day": 8,
    "vacation-per-year": 4,
    "value-hour": 75
  },
  controllers:{
    index(req, res){
      return res.render(views + "profile", { profile: Profile.data })
    },
    update(req,res){
      // req.body para pegar os dados
      const data = req.body

      // definir quantas semanas tem num ano:52
      const weeksPerYear = 52

      // remover as semanas de férias do ano, para pegar quantas semanas tem em 1 mês
      const weeksPerMonth = (weeksPerYear - data["vacation-per-year"]) / 12
      
      // Total de horas trabalhada na semana
      const weekTotalHours =  data["hours-per-day"] * data["days-per-week"]
     
      // total de horas trabalhadas no mes
      const monthlyTotalHours =  weekTotalHours * weeksPerMonth

      // Valor da minha hora
      const valueHour =  data["value-hour"] = data["monthly-budget"] / monthlyTotalHours

      Profile.data = {
        ...Profile.data,
        ...req.body,
        "value-hour": valueHour
      }
      return res.redirect("/profile")
    }
  }
};

const Job={
  data: [
    {
      id: 1,
      name: "Pizzaria Guloso",
      "daily-hours": 2,
      "total-hours": 60,
      created_at: Date.now(),
    },
    {
      id: 2,
      name: "OneTwo",
      "daily-hours": 3,
      "total-hours": 2,
      created_at: Date.now(),
    }
  ],
  controllers:{
    index(req, res) {
      // map() = ele permite receber algo, no caso, um array novo, diferente do forEach que não possibilita
      const updatedJobs = Job.data.map((job) =>{
      const remaining = Job.services.remainingDays(job)
      const status = remaining <=0 ? "done" : "progress"
    
      // ...job = espalhamento, trazendo as propriedades sem precisar escrever novamente.
      return{ 
        ...job,
        remaining,
        status,
        budget: Job.services.calculateBudget(job, Profile.data["value-hour"])
      }
    })
      return res.render(views + "index", {jobs: updatedJobs})
    },
    save(req,res){
      /**
      * Para atribuir o id ao jobs, uma das formas é verificar o tamanho do
      *  array e subtrair 1, pois, o array começa na posição 0 e para  atribuir
      * o id correto é necessário subtrair 1 para pegar o elemento na posição
      * certa. Porém se o array estiver vazio, ao subtrair 1 não vai existir
      * o elemento, então para sair disso no JS pode se utilizar o ? que se
      * o elemento existir você pega o id dele, ou você atribui o valor 1
      * pro jobId
      */

      const lastId = Job.data[Job.data.length - 1]?.id || 0;

          Job.data.push({
            id : lastId + 1,
            name: req.body.name,
            "daily-hours": req.body["daily-hours"],
            "total-hours": req.body["total-hours"],
            created_at: Date.now() // Atribuindo data de hoje
          })
            return res.redirect("/")
    },
    create(req,res){
      return res.render(views + "job")
    },
    show(req,res){
      // Pegar o paramentro que é passado na url. O req.params. 
      // esse nome(id) precisa ser igual ao que você colocou na rota
      // Esse parametro é do tipo string
      const jobId = req.params.id

      // Pra cada função se for verdadeira a condição que você passou 
      // ele retorna e atribui o objeto,no caso, job e atribui a constante.
      const job = Job.data.find(job => Number(job.id) === Number(jobId))

      if(!job){
        return res.send("Job não encontrado")
      }

      job.budget = Job.services.calculateBudget(job, Profile.data["value-hour"])
     
      return res.render(views + "job-edit", {job})
    },
    update(req,res){
      const jobId = req.params.id

      const job = Job.data.find(job => Number(job.id) === Number(jobId))

      if(!job){
        return res.send("Job não encontrado")
      }

      const updatedJob = {
        ...job,
        name: req.body.name,
        "total-hours": req.body["total-hours"],
        "daily-hours": req.body["daily-hours"]
      }

      Job.data = Job.data.map(job => {
        if (Number(job.id) === Number(jobId)) {
          job = updatedJob
        }
        return job
      })
      res.redirect('/job/' + jobId)
    },
    delete(req,res){
      const jobId = req.params.id

      // Filtra e retorna num array os dados.Nesse caso 
      // se o id for igual ele remove senão ele mantem
      Job.data = Job.data.filter(job => Number(job.id) !== Number(jobId))

      return res.redirect("/")
    }
  },
  services:{
    remainingDays(job){
      //Calculo dos dias restantes
      // Função toFixed() arredonda o valor e transforma em string
      const remainingDays = (job["total-hours"] / job["daily-hours"]).toFixed()
    
      const createdDate = new Date(job.created_at)
      // getDay = dias da semana (0 a 6) | getDate = dia do mês
      // Number() converte para numero novamente
      const dueDay = createdDate.getDate() + Number(remainingDays)
      //setDate() = retorna o valor em milesegundos
      const dueDate = createdDate.setDate(dueDay)
    
      const timeDiffInMs = dueDate - Date.now()
    
      //Transformar milesegundos em dias
      const dayInMs = 1000 * 60 * 60 * 24
      // Math.floor = arredonda para baixo
      const dayDiff = Math.floor(timeDiffInMs / dayInMs)
    
      // restam x dias
      return dayDiff
    },
    calculateBudget: (job, valueHour) => valueHour * job["total-hours"]
  }
}

routes.get("/", Job.controllers.index)
routes.get("/job", Job.controllers.create)
/**
 * Utilizando o request.body você irá trazer as informações, nesse caso,
 * somente do corpo da requisição no caso os dados do formulário.
 */
routes.post("/job", Job.controllers.save)
routes.get("/job/:id", Job.controllers.show)
routes.post("/job/:id", Job.controllers.update)
routes.post("/job/delete/:id", Job.controllers.delete)
/**
 * Quando no JS a propriedade tem o mesmo nome do valor que esta sendo enviado
 * no caso um objeto, você pode deixar só um nome
 */
routes.get("/profile", Profile.controllers.index)
routes.post("/profile", Profile.controllers.update)


module.exports = routes;
