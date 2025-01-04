package com.trustXchange.entities.block;

import javax.persistence.*;

import org.checkerframework.checker.units.qual.C;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "block_examed")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlockExamed {
        @Id
        @Column(name = "contract_name")
        private String contractName;
    
        @Column(name = "last_examed_block_number" , nullable = false)
        private Long lastExamedBlockNumber = 0L;
}
