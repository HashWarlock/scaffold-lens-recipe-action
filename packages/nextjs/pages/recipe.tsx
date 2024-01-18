import React from 'react';
import {NextPage} from "next";
import {RecipeOpenAction} from "~~/components/recipe/RecipeOpenAction";
import {RecipeProcess} from "~~/components/recipe/RecipeProcess";

const Recipe: NextPage = () => {
    return (
        <>
            <div className="grid lg:grid-cols-2 flex-grow">
                <RecipeOpenAction/>
                <RecipeProcess/>
            </div>
        </>
    );
};

export default Recipe;
