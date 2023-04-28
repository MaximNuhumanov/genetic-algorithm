//Схрещування було вирішенно прибрати з генетичного алгоритму бо воно заповільнює программу
//й не приносить результату на менших ітераціях.
const fs = require('fs'); 
let input = JSON.parse(fs.readFileSync('input.json')); 

const population_size = 200; 
const p_mutation = 0.1; 
const corrections = input.corrections;
const corrections_length = corrections.length;   

var cells = input.cells;

//додаємо нулів
for(let i = 0; i < corrections_length * 2; i++)
{
    cells.push(0);
}

class Individual extends Array
{
    constructor ()
    {
        super();
        this.fitness = 0;
    }   
};
function individualCreator()
{   
    let individ = new Individual();
    let i;
    let j;
    let main_thruster =[]
    let sec_thruster =[]
    for (let count = 0; count < corrections_length; count++)
    {        
        
        do{
            i = Math.floor(Math.random() * cells.length);
            j = Math.floor(Math.random() * cells.length);
        }while(i == j || (cells[i] + cells[j]/2) > corrections[count])
        //Працюємо із індексами бо значення можуть повторюваться 
        main_thruster.push(cells[i])
        sec_thruster.push(cells[j])
        
    }
    
    individ.push(main_thruster , sec_thruster);
    return individ
}
function fitness(individ)
{  
    let arr = individ[0].concat(individ[1]);

    for(let i =0; i < arr.length-1; i++)
    {      
        for(let j = i + 1; j < arr.length; j++)
        {
            //Якщо індекси повторюються,то fitness = 0
            //правило не стосується нульових значень
            if(arr[i] == arr[j] && cells[arr[i]] != 0)
            {
                individ.fitness = 0;
                return individ;
            }
        }
    }
    let sum = 0;
    for(let i =0; i < individ[0].length; i++)
    {     
        //Якщо прискорення виходить більше допустимого, то fitness = 0    
        if((cells[individ[0][i]] + cells[individ[1][i]]/2) > corrections[i])
        {
            individ.fitness = 0;
            return individ
        }

        sum += (cells[individ[0][i]] + (cells[individ[1][i]]/2))/corrections[i];       
    }
    individ.fitness = Math.round((sum / individ[0].length) * 100);
    return individ
}   

function tournament(population)
{
    var offspring = [];
    for (let i = 0; i < population.length; i++)
    {
        var i1 = 0;
        var i2 = 0;
        var i3 = 0;
        while (i1 == i2 || i1 == i3 || i2 == i3)
        {
            i1 = Math.floor(Math.random() * population.length);
            i2 = Math.floor(Math.random() * population.length);
            i3 = Math.floor(Math.random() * population.length);
        }
        let arr = [population[i1], population[i2], population[i3]];
        max = arr[0];
        for(let j = 1; j < 3; j++)
        {
            if(arr[j].fitness > max.fitness)
            {
                max = arr[j];
            }
        }
        offspring.push(clone(max));

    }
 
    return offspring
}

function mutation(mutant, indpb = 0.01)
{    
    for (let count = 0; count < mutant[0].length; count++)
    {    
        if (Math.random() < indpb)
        {
            do{
                i = Math.floor(Math.random() * cells.length);
                j = Math.floor(Math.random() * cells.length);
            }while(i == j || (cells[i] + cells[j]/2) > corrections[count] )
            mutant[0][count] = i;
            mutant[1][count] = j;
        }
    }
    
}
function clone(individ)
{
    let clone =  new Individual();; 
    clone.push(individ[0].slice(0));
    clone.push(individ[1].slice(0));

    clone.fitness = individ.fitness;

    return clone
}
function maximum(population)
{
    let max = population[0];
    for(let i in population)
    {
        if(population[i].fitness > max.fitness)
        {
            max = population[i];
        }
    }
    return max
}

var population = [];
for (let i = 0; i < population_size; i++)
{
    population.push(individualCreator());
}
for(let i in population)
{
    fitness(population[i]);
}
var generationCounter = 0;

var solution  = population[0];

while (generationCounter < 1000)
{
    if(maximum(population).fitness > solution.fitness)
    {
        solution  = maximum(population)
    }
    
    generationCounter += 1;
    population = tournament(population)


    for (mutant of population)
    {
        if (Math.random() < p_mutation)
        {
            mutation(mutant, 1.0 / corrections_length)
        }
        
    }
    for(i in population)
    {
        fitness(population[i]);
    }
}


  
var main_thruster = [];
var sec_thruster = [];
var delta_velocity = 0;
//Якщо ввести важкі для алгоритму значення,
//то деякою верогідністю алгоритм не знаходить значення
if(solution.fitness != 0)
{
    for (let i = 0; i < solution[0].length; i++)
    {
        main_thruster.push(cells[solution[0][i]]);
        sec_thruster.push(cells[solution[1][i]]);
        delta_velocity +=  cells[solution[0][i]] +  cells[solution[1][i]]/2;
    }
    var obj = {"main_thruster": main_thruster, "sec_thruster": sec_thruster, "delta_velocity": delta_velocity};
    console.log(obj);
    let data = JSON.stringify(obj, null, 4);
    fs.writeFileSync('output.json', data);
}
else
{   
    
    console.error("Рішення не знайдене");
}


