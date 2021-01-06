import express from 'express';
const router = express.Router();
import { promises as fs } from 'fs';

global.fileName = 'grades.json';

const { readFile, writeFile } = fs;

router.post('/', async (req, res, next) => {
    try {
        let person = req.body
        const data = JSON.parse(await readFile(global.fileName));

        //FALTA VALIDAR OS CAMPOS
        person = {
            id: data.nextId++,
            student: person.student,
            subject: person.subject,
            type: person.type,
            value: person.value,
            timestamp: new Date()
        }

        data.grades.push(person)
        await writeFile(global.fileName, JSON.stringify(data, null, 2))

        res.send(person);
    } catch (err) {
        next(err)
    }
});

router.put('/', async (req, res, next) => {
    try {
        const account = req.body
        const data = JSON.parse(await readFile(global.fileName));

        const index = data.grades.findIndex(grade => grade.id === account.id);

        const { student, subject, type, value } = account
        data.grades[index].student = student
        data.grades[index].subject = subject
        data.grades[index].type = type
        data.grades[index].value = value

        await writeFile(global.fileName, JSON.stringify(data, null, 2))

        console.log(account)
        res.send(account);
    } catch (err) {
        next(err)
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));

        const result = data.grades.find(grade => grade.id === parseInt(req.params.id));

        res.send(result);
    } catch (err) {
        next(err)
    }
});

router.get('/', async (req, res, next) => {
    try {
        let consultaPerson = []
        const data = JSON.parse(await readFile(global.fileName));
        const { student, subject } = req.body

        if (!student || subject == "") {
            throw new Error("Erro de escrita!")
        }

        data.grades.filter((person) => {
            if (person.student == student && person.subject == subject) {
                consultaPerson.push({ value: person.value })
            }
        })

        let total = 0
        consultaPerson.forEach((nota) => {
            total += nota.value
        })

        if (total === 0) {
            throw new Error("Este aluno não tem notas para computar.")
        }

        console.log(total)
        res.send({ "Nota total": total });
    } catch (err) {
        next(err)
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        data.grades = data.grades.filter(student => student.id !== parseInt(req.params.id));
        await writeFile(global.fileName, JSON.stringify(data, null, 2))
        res.send(data);
    } catch (err) {
        next(err)
    }
});

router.get('/alunos/notas/geral', async (req, res, next) => {
    try {
        let subject_type = []
        const { subject, type } = req.body
        const data = JSON.parse(await readFile(global.fileName));
        data.grades.filter((person) => {
            if (person.subject == subject || person.type == type) {
                subject_type.push({ notas: person.value })
            }
        })
        let notaTotal = 0
        subject_type.forEach((nota) => {
            notaTotal += nota.notas
        })
        console.log({ subject, type, "Nota em geral": notaTotal })
        res.send(`Nota total em ${subject} do tipo ${type} é: ${notaTotal}`);
    } catch (err) {
        next(err)
    }
});

router.get('/alunos/notas/media', async (req, res, next) => {
    try {
        let subject_type = []
        const { subject, type } = req.body
        const data = JSON.parse(await readFile(global.fileName));
        data.grades.filter((person) => {
            if (person.subject == subject || person.type == type) {
                subject_type.push({ notas: person.value })
            }
        })
        let notaTotal = 0
        subject_type.forEach((nota) => {
            notaTotal += nota.notas
        })
        console.log({ subject, type, "Média em geral": (notaTotal / subject_type.length) })
        res.send(`Média total em ${subject} do tipo ${type} é: ${(notaTotal / subject_type.length)}`);
    } catch (err) {
        next(err)
    }
});

router.get('/alunos/notas/top3', async (req, res, next) => {
    try {
        let subject_type = []
        const { subject, type } = req.body
        const data = JSON.parse(await readFile(global.fileName));
        data.grades.filter((person) => {
            if (person.subject == subject || person.type == type) {
                subject_type.push({ student: person.student, value: person.value })
            }
        })

        subject_type.sort((a, b) => {
            return a.value - b.value
        })

        const resultados = []
        subject_type
            .slice(-3)
            .forEach((grade) => {
                resultados.push([grade.student, grade.value])
            })

        console.log(resultados)
        res.send({"Melhores 3 notas são": resultados})
    } catch (err) {
        next(err)
    }
});

router.use((err, req, res, next) => {
    console.log(err)
    res.status(400).send({ error: err.message })
})

export default router;